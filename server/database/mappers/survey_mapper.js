const { pool } = require("../DAO");
const surveySql = require("../sql/servey.js");

const runQuery = async (query, params = []) => {
  let conn = null;

  try {
    conn = await pool.getConnection();
    return await conn.query(query, params);
  } catch (err) {
    // mapper는 에러를 가공해서 숨기지 않는다.
    // 최종 에러 응답 형태는 router가 책임지고, 여기서는 원인만 그대로 올린다.
    throw err;
  } finally {
    // 가벼운 SELECT라도 getConnection()을 썼다면 반드시 반납해야 한다.
    // release를 빼먹으면 요청이 쌓일수록 pool이 막혀 전체 서버가 느려질 수 있다.
    if (conn) {
      conn.release();
    }
  }
};

const selectSurvey = async (versionId) => {
  return runQuery(surveySql.selectSurvey, [versionId]);
};

const insertItem = async (params) => {
  return runQuery(surveySql.insert_item, [
    params.item_name,
    params.version_id,
    params.version_id,
  ]);
};

const insertSubItem = async (params) => {
  return runQuery(surveySql.insert_subitem, [
    params.sub_item_name,
    params.item_id,
    params.item_id,
  ]);
};

const insertSurveyDetail = async (params) => {
  return runQuery(surveySql.insert_detail, [
    params.question_text,
    params.sub_item_id,
    params.sub_item_id,
  ]);
};

const deleteItems = async (ids) => {
  return runQuery("delete from survey_item where item_id in (?);", [ids]);
};

const deleteSubItems = async (ids) => {
  return runQuery("delete from survey_sub_item where sub_item_id in (?);", [ids]);
};

const deleteDetails = async (ids) => {
  return runQuery("delete from survey_detail where detail_id in (?);", [ids]);
};

const getVersions = async () => {
  return runQuery(surveySql.selectVersionList);
};

const getActiveVersionId = async () => {
  const rows = await runQuery(surveySql.memberSurvey);
  return rows.length > 0 ? rows[0].version_id : null;
};

const submitSurveyApplication = async (params) => {
  let conn = null;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 신청서 1건과 답변 여러 건은 논리적으로 한 묶음이다.
    // 둘 중 하나만 저장되면 "신청서는 있는데 답변이 비어 있음" 같은
    // 불완전한 데이터가 생기므로 반드시 하나의 트랜잭션으로 처리한다.
    const applicationResult = await conn.query(surveySql.insert_application, [
      params.version_id,
      params.bene_id,
      params.user_id,
    ]);

    const appId = applicationResult.insertId;

    if (!appId) {
      throw new Error("신청서 저장 후 생성된 app_id를 확인할 수 없습니다.");
    }

    const answerRows = Object.entries(params.answers).map(
      ([detailId, answerValue]) => [answerValue ? 1 : 0, detailId, appId],
    );

    // 답변 수만큼 insert를 반복하면 질문 개수만큼 쿼리가 발생한다.
    // mariadb 드라이버의 conn.batch()를 쓰면 같은 insert 문에 파라미터만 여러 벌 보내
    // N+1 성격의 비효율을 줄이고 코드도 더 짧게 유지할 수 있다.
    if (answerRows.length > 0) {
      await conn.batch(surveySql.insert_survey_answer, answerRows);
    }

    await conn.commit();

    return appId;
  } catch (err) {
    if (conn) {
      await conn.rollback();
    }
    throw err;
  } finally {
    // 트랜잭션 성공/실패와 무관하게 커넥션은 반드시 finally에서 반납한다.
    if (conn) {
      conn.release();
    }
  }
};

const getApplicationById = async (appId) => {
  const rows = await runQuery(surveySql.select_application_by_id, [appId]);
  return rows.length > 0 ? rows[0] : null;
};

const getAnswersByAppId = async (appId) => {
  return runQuery(surveySql.select_answers_by_app_id, [appId]);
};

const getApplicationList = async (beneId) => {
  return runQuery(surveySql.select_application_list_by_bene, [beneId]);
};

const deleteApplicationTransaction = async (appId) => {
  let conn = null;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // survey_answer가 application을 참조하므로 자식 테이블을 먼저 삭제한다.
    // 이 순서를 지키면 외래키 문제나 고아 데이터 위험을 피할 수 있다.
    await conn.query(surveySql.delete_survey_answers, [appId]);
    await conn.query(surveySql.delete_application, [appId]);

    await conn.commit();
    return true;
  } catch (err) {
    if (conn) {
      await conn.rollback();
    }
    throw err;
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const createNewVersion = async (targetVersionId) => {
  let conn = null;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 설문 버전은 동시에 하나만 active여야 한다.
    // 먼저 기존 active를 내리고, 사용자가 선택한 버전을 다시 active로 올린다.
    await conn.query(surveySql.deactivateVersions);

    if (targetVersionId) {
      await conn.query(surveySql.setActiveVersion, [targetVersionId]);
    }

    // 운영에 쓰는 active 버전은 유지하고,
    // 다음 수정을 위한 draft 버전을 새로 하나 만들어 둔다.
    const result = await conn.query(surveySql.insertNewDraftVersion);

    await conn.commit();

    return result.insertId;
  } catch (err) {
    if (conn) {
      await conn.rollback();
    }
    throw err;
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const checkActiveApplication = async (beneId) => {
  const rows = await runQuery(surveySql.check_active_application, [beneId]);
  return rows.length > 0 ? rows[0].cnt : 0;
};

const getApplicationStatus = async (appId) => {
  const rows = await runQuery(surveySql.select_application_status, [appId]);
  return rows.length > 0 ? rows[0] : null;
};

const updateApplicationsToInProgressByBene = async (beneId) => {
  const result = await runQuery(
    surveySql.update_applications_to_inprogress_by_bene,
    [beneId],
  );

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
  getActiveVersionId,
  submitSurveyApplication,
  getApplicationById,
  getAnswersByAppId,
  getApplicationList,
  deleteApplicationTransaction,
  createNewVersion,
  checkActiveApplication,
  getApplicationStatus,
  updateApplicationsToInProgressByBene,
};
