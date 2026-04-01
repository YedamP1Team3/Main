// database/mappers/survey_mapper.js
const { pool } = require("../DAO");
const surveySql = require("../sql/servey.js");

const selectSurvey = async (versionId) => {
  // 실무 원칙 1: 트랜잭션이 아니더라도 단일 커넥션을 직접 제어할 때는
  // try-catch-finally를 사용하여 커넥션 반납(release)을 보장해야 풀이 고갈되지 않습니다.
  let conn = null;
  try {
    conn = await pool.getConnection();

    // 실무 원칙 2: mariadb 패키지는 SELECT 쿼리 결과로 배열(Rows) 자체를 바로 반환합니다.
    // mysql2처럼 const [rows] = ... 형태로 이중 배열 구조 분해 할당을 하면 안 됩니다.
    const rows = await conn.query(surveySql.selectSurvey, [versionId]);
    return rows;
  } catch (err) {
    console.error("Mapper Error (selectSurvey):", err);
    throw err; // 에러를 삼키지 않고 위로 던져서 Router가 500 응답을 줄 수 있게 합니다.
  } finally {
    if (conn) conn.release(); // 정상 종료든 에러든 무조건 커넥션을 풀에 돌려줍니다.
  }
};

const insertItem = async (params) => {
  // 단일 쿼리는 pool.query를 써도 내부적으로 커넥션을 가져왔다 반납합니다.
  // 트랜잭션이 필요 없는 단순 단건 처리에 적합합니다.
  const result = await pool.query(surveySql.insert_item, [
    params.item_name,
    params.version_id,
    params.version_id,
  ]);

  // mariadb에서 INSERT/UPDATE/DELETE의 결과는
  // 배열이 아니라 객체 { insertId, affectedRows } 형태입니다.
  return result;
};

const insertSubItem = async (params) => {
  const result = await pool.query(surveySql.insert_subitem, [
    params.sub_item_name,
    params.item_id,
    params.item_id,
  ]);
  return result;
};

const insertSurveyDetail = async (params) => {
  const result = await pool.query(surveySql.insert_detail, [
    params.question_text,
    params.sub_item_id,
    params.sub_item_id,
  ]);
  return result;
};

// DELETE 시 파라미터가 배열(ids)일 때, 쿼리문 안에 IN (?) 을 사용하면
// [1, 2, 3] 배열 자체가 알아서 치환되어 삭제됩니다.
const deleteItems = (ids) =>
  pool.query("DELETE FROM survey_item WHERE item_id IN (?)", [ids]);
const deleteSubItems = (ids) =>
  pool.query("DELETE FROM survey_sub_item WHERE sub_item_id IN (?)", [ids]);
const deleteDetails = (ids) =>
  pool.query("DELETE FROM survey_detail WHERE detail_id IN (?)", [ids]);

const getVersions = async () => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(surveySql.selectVersionList);
    return rows;
  } finally {
    if (conn) conn.release();
  }
};

const getActiveVersionId = async () => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(surveySql.memberSurvey);

    // 조회 결과가 있으면 DB 소문자 컬럼명 그대로 가져옵니다.
    return rows.length > 0 ? rows[0].version_id : null;
  } catch (err) {
    console.error("Mapper Error (getActiveVersionId):", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// [매우 중요] 지원신청서 마스터와 답변 다건을 동시에 저장하는 핵심 로직
const submitSurveyApplication = async (params) => {
  let conn = null;
  try {
    conn = await pool.getConnection();

    // 하나라도 실패하면 전체를 취소(Rollback)하기 위해 트랜잭션을 시작합니다.
    await conn.beginTransaction();

    // 1. 마스터 테이블(신청서) 먼저 생성
    const appResult = await conn.query(surveySql.insert_application, [
      params.version_id,
      params.bene_id,
      params.user_id,
    ]);

    // mariadb는 insertId를 바로 객체 속성으로 줍니다. 지저분한 || 방어 코드 삭제.
    const appId = appResult.insertId;

    if (!appId)
      throw new Error("신청서 생성 실패: insertId를 가져오지 못했습니다.");

    // 2. 답변 배열 저장 최적화 (N+1 쿼리 문제 해결)
    const answers = params.answers;

    // [실무 핵심] for문 안에서 await conn.query를 수십 번 날리면 DB 통신 비용(네트워크 오버헤드)이 엄청납니다.
    // 벌크 인서트(Bulk Insert)를 위해 2차원 배열 형태로 데이터를 준비합니다.
    const batchData = [];
    for (const [detailId, answerValue] of Object.entries(answers)) {
      // 파라미터 순서: [answer_value, detail_id, app_id]
      batchData.push([answerValue, detailId, appId]);
    }

    // 데이터가 있을 경우, mariadb 전용 메서드인 conn.batch()를 사용해 단 한 번의 통신으로 전부 INSERT 합니다.
    if (batchData.length > 0) {
      await conn.batch(surveySql.insert_survey_answer, batchData);
    }

    // 모든 작업이 완벽히 끝났으므로 DB에 확정(Commit) 처리합니다.
    await conn.commit();
    return appId;
  } catch (err) {
    // 에러 발생 시 진행된 모든 사항을 원상 복구(Rollback) 합니다.
    if (conn) await conn.rollback();
    console.error("Mapper Error (submitSurveyApplication):", err);
    throw err;
  } finally {
    // 롤백이 되든 커밋이 되든 트랜잭션 종료 후 커넥션 반납은 필수입니다.
    if (conn) conn.release();
  }
};

const getApplicationById = async (appId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(surveySql.select_application_by_id, [appId]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    if (conn) conn.release();
  }
};

const getAnswersByAppId = async (appId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    // 배열로 바로 뱉으므로 그대로 반환합니다.
    return await conn.query(surveySql.select_answers_by_app_id, [appId]);
  } finally {
    if (conn) conn.release();
  }
};

const getApplicationList = async (beneId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    return await conn.query(surveySql.select_application_list_by_bene, [
      beneId,
    ]);
  } finally {
    if (conn) conn.release();
  }
};

const deleteApplicationTransaction = async (appId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction(); // 상세 데이터와 마스터 데이터를 같이 지우므로 트랜잭션 필수

    // FK 제약 조건 등을 고려하여 상세(Answer)부터 지우고 마스터(Application)를 지웁니다.
    await conn.query(surveySql.delete_survey_answers, [appId]);
    await conn.query(surveySql.delete_application, [appId]);

    await conn.commit();
    return true;
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const createNewVersion = async (targetVersionId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    await conn.query(surveySql.deactivateVersions);

    if (targetVersionId) {
      await conn.query(surveySql.setActiveVersion, [targetVersionId]);
    }

    const result = await conn.query(surveySql.insertNewDraftVersion);

    await conn.commit();
    return result.insertId;
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Mapper Error (createNewVersion):", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const checkActiveApplication = async (beneId) => {
  // 집계 함수(COUNT) 단일 조회이므로 pool.query 사용
  const rows = await pool.query(surveySql.check_active_application, [beneId]);
  // mariadb는 SELECT 시 깔끔하게 배열로 떨어지므로 복잡한 이중 배열 검사 로직 삭제
  return rows.length > 0 ? rows[0].cnt : 0;
};

const getApplicationStatus = async (appId) => {
  const rows = await pool.query(surveySql.select_application_status, [appId]);
  return rows.length > 0 ? rows[0] : null;
};

const updateApplicationToInProgress = async (appId) => {
  const result = await pool.query(surveySql.update_status_inprogress, [appId]);
  // UPDATE의 결과는 affectedRows 속성으로 확인 가능
  return result.affectedRows;
};

// 대상자 ID 기준으로 상태 변경하는 기능
const updateApplicationsToInProgressByBene = async (beneId) => {
  const query = surveySql.update_status_inprogress.replace(
    "WHERE app_id = ?",
    "WHERE bene_id = ?",
  );
  const result = await pool.query(query, [beneId]);
  return result.affectedRows;
};

module.exports = {
  selectSurvey,
  insertItem,
  insertSubItem,
  insertSurveyDetail,
  deleteItems,
  deleteSubItems,
  deleteDetails,
  getVersions,
  createNewVersion,
  getActiveVersionId,
  submitSurveyApplication,
  getApplicationById,
  getAnswersByAppId,
  getApplicationList,
  deleteApplicationTransaction,
  checkActiveApplication,
  getApplicationStatus,
  updateApplicationToInProgress,
  updateApplicationsToInProgressByBene,
};
