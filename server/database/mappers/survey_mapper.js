// database/mappers/survey_mapper.js
const { pool } = require("../DAO");
const surveySql = require("../sql/servey.js");

// 🚨 [수정] 함수 정의 부분에 (versionId) 인자를 반드시 추가해야 합니다!
const selectSurvey = async (versionId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();

    // 💡 디버깅용 로그: 실제로 DB에 어떤 ID를 던지는지 확인
    // console.log("DB 조회 시도 versionId:", versionId);

    // [ ] 배열 안에 versionId를 넣어서 SQL의 ? 자리에 매칭시킵니다.
    let rows = await conn.query(surveySql.selectSurvey, [versionId]);

    return rows;
  } catch (err) {
    console.error("Mapper Error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const insertItem = async (params) => {
  try {
    const result = await pool.query(surveySql.insert_item, [
      params.item_name,
      params.version_id,
      params.version_id,
    ]);
    return result;
  } catch (dbError) {
    console.error(dbError);
    throw dbError;
  }
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

const deleteItems = (ids) =>
  pool.query("DELETE FROM survey_item WHERE item_id IN (?)", [ids]);
const deleteSubItems = (ids) =>
  pool.query("DELETE FROM survey_sub_item WHERE sub_item_id IN (?)", [ids]);
const deleteDetails = (ids) =>
  pool.query("DELETE FROM survey_detail WHERE detail_id IN (?)", [ids]);

// ⭐️ 추가: 버전 목록을 가져오는 매퍼 함수
const getVersions = async () => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    // surveySql에 selectVersionList 쿼리가 정의되어 있어야 합니다.
    let rows = await conn.query(
      surveySql.selectVersionList ||
        "SELECT * FROM survey_version ORDER BY VERSION_ID DESC",
    );
    return rows;
  } finally {
    if (conn) conn.release();
  }
};

// ⭐️ [MEMBER용] 현재 활성화된(1) 버전 ID 딱 하나만 가져오는 함수 추가
const getActiveVersionId = async () => {
  let conn = null;
  try {
    conn = await pool.getConnection();

    // 복잡한 JOIN 없이, 단순히 활성 상태인 버전의 ID만 찾습니다.
    let rows = await conn.query(surveySql.memberSurvey);

    // 결과가 있으면 첫 번째 행의 ID를 반환, 없으면 null 반환
    return rows.length > 0 ? rows[0].VERSION_ID : null;
  } catch (err) {
    console.error("❌ [Mapper 에러] 활성 버전 ID 조회 실패:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
// [추가] 지원신청서 및 답변 트랜잭션 저장 로직
const submitSurveyApplication = async (params) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction(); // ⭐️ 트랜잭션 시작 (실패 시 롤백을 위함)

    // 1. APPLICATION (지원신청서) 테이블에 INSERT
    // 파라미터 순서: VERSION_ID, BENE_ID, USER_ID
    const appResult = await conn.query(surveySql.insert_application, [
      params.version_id,
      params.bene_id,
      params.user_id,
    ]);

    // 새로 생성된 신청서의 APP_ID (PK) 추출
    const appId =
      appResult.insertId ||
      (appResult[0] && appResult[0].insertId) ||
      appResult.affectedRows;

    if (!appId)
      throw new Error("신청서 생성 실패: APP_ID를 가져올 수 없습니다.");

    // 2. Survey_Answer (조사지답변) 테이블에 다중 INSERT
    // 프론트에서 온 답변 데이터 형태: { "상세내용_ID": true, "상세내용_ID": false }
    const answers = params.answers;

    // 객체(Object) 형태의 답변을 배열 형태로 변환하여 반복 저장
    for (const [detailId, answerValue] of Object.entries(answers)) {
      // 파라미터 순서: ANSWER_VALUE, DETAIL_ID, APP_ID
      await conn.query(surveySql.insert_survey_answer, [
        answerValue, // true/false (또는 1/0)
        detailId, // 프론트에서 넘어온 문항의 DETAIL_ID
        appId, // 방금 위에서 만든 신청서의 ID
      ]);
    }

    await conn.commit(); // ⭐️ 모든 저장이 성공하면 DB에 확정!

    return appId; // 생성된 신청서 번호 반환
  } catch (err) {
    if (conn) await conn.rollback(); // 🚨 중간에 하나라도 에러나면 전체 취소!
    console.error("❌ [Mapper 에러] 설문 답변 저장 중 오류:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// [조회] 신청서 번호로 마스터 정보 조회
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

// [조회] 신청서 번호로 답변 목록 조회
const getAnswersByAppId = async (appId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(surveySql.select_answers_by_app_id, [appId]);
    return rows;
  } finally {
    if (conn) conn.release();
  }
};

// [목록 조회] 대상자 ID로 신청서 리스트 조회
const getApplicationList = async (beneId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(surveySql.select_application_list_by_bene, [
      beneId,
    ]);
    // console.log(rows);
    return rows; // 리스트 반환
  } finally {
    if (conn) conn.release();
  }
};

const deleteApplicationTransaction = async (appId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
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

// createNewVersion 함수를 덮어씌웁니다.
const createNewVersion = async (targetVersionId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1. 기존 모든 버전 비활성화 (전체 FALSE)
    await conn.query(surveySql.deactivateVersions);

    // 2. 선택한 버전을 활성화 (TRUE)
    if (targetVersionId) {
      await conn.query(
        surveySql.setActiveVersion ||
          `UPDATE survey_version SET IS_ACTIVE = 1 WHERE VERSION_ID = ?`,
        [targetVersionId],
      );
    }

    // 3. 수정용 새 버전(FALSE) 생성
    const result = await conn.query(
      surveySql.insertNewDraftVersion ||
        `INSERT INTO survey_version (IS_ACTIVE, CREATE_DATE) VALUES (0, NOW());`,
    );

    await conn.commit();

    const insertId =
      result.insertId ||
      (result[0] && result[0].insertId) ||
      result.affectedRows;
    return insertId; // 새로 생성된 가장 큰 PK 반환
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Mapper Error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// [추가] 활성화된 신청서 체크 (중복 방어)
const checkActiveApplication = async (beneId) => {
  const result = await pool.query(surveySql.check_active_application, [beneId]);
  // 💡 드라이버(mysql2 등)에 따른 이중 배열 엣지 케이스 방어
  const rows =
    Array.isArray(result) && Array.isArray(result[0]) ? result[0] : result;
  return rows[0]?.cnt || 0;
};

// [추가] 신청서 상태 조회 (삭제 방어)
const getApplicationStatus = async (appId) => {
  const result = await pool.query(surveySql.select_application_status, [appId]);
  const rows =
    Array.isArray(result) && Array.isArray(result[0]) ? result[0] : result;
  return rows.length > 0 ? rows[0] : null;
};

// [추가] 상태를 '진행중'으로 업데이트
const updateApplicationToInProgress = async (appId) => {
  const result = await pool.query(surveySql.update_status_inprogress, [appId]);
  return result.affectedRows || result[0]?.affectedRows;
};
const updateApplicationsToInProgressByBene = async (beneId) => {
  const query = surveySql.update_status_inprogress.replace(
    "WHERE app_id = ?",
    "WHERE bene_id = ?",
  );
  const result = await pool.query(query, [beneId]);
  return result.affectedRows || result[0]?.affectedRows;
};
// module.exports 에 deleteApplicationTransaction 추가
module.exports = {
  selectSurvey,
  insertItem,
  insertSubItem,
  insertSurveyDetail,
  deleteItems,
  deleteSubItems,
  deleteDetails,
  getVersions, // 추가됨
  createNewVersion,
  //member 용
  getActiveVersionId,
  submitSurveyApplication,
  getApplicationById,
  getAnswersByAppId,
  getApplicationList,
  deleteApplicationTransaction,
  //구조 변경
  checkActiveApplication,
  getApplicationStatus,
  updateApplicationToInProgress,
  updateApplicationsToInProgressByBene,
};
