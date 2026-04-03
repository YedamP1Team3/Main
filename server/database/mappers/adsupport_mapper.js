const { pool } = require("../DAO");
const adminSql = require("../sql/adsupport.js");

const selectSupportPlanList = async (beneId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(adminSql.selectSupportPlanList, [beneId]);
    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const selectSupportPlanDetail = async (planId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(adminSql.selectSupportPlanDetail, [planId]);
    return rows[0];
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const approveSupportPlan = async (planID) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let result = await conn.query(adminSql.approveSupportPlan, [planID]);
    await conn.commit();
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

//반려 업데이트
const returnSupportPlan = async (planId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let result = await conn.query(adminSql.returnSupportPlan, [planId]);
    await conn.commit();
    return result;
  } catch (err) {
    console.log(err);
    if (conn) await conn.rollback();
    return { affectedRows: 0, error: err.message };
  } finally {
    if (conn) conn.release();
  }
};

//history insert
const addRejectionHistory = async (insertDate) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(adminSql.addRejectionHistory, insertDate);
    return rows;
  } catch (err) {
    console.error("이력 조회 중 오류:", err);
    return { error: err.message };
  } finally {
    if (conn) conn.release();
  }
};

//반려사유 리스트
const selectRejectionHistory = async (planId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(adminSql.selectRejectionHistory, [planId]);
    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const selectBeneficiariesNames = async (agencyId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let row = await conn.query(adminSql.selectBeneficiariesNames, [agencyId]);
    return row;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const selectSupportResultList = async (beneId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(adminSql.selectSupportResultList, [beneId]);
    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const selectSupportResultDetail = async (planId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(adminSql.selectSupportResultDetail, [planId]);
    return rows[0];
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const selectAttachments = async (planId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(adminSql.selectAttachments, [planId]);
    return result;
  } catch (err) {
    console.error("매퍼 에러 (selectAttachments):", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const selectResultAttachments = async (resultId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(adminSql.selectResultAttachments, [resultId]);
    return result;
  } catch (err) {
    console.error("매퍼 에러 (selectResultAttachments):", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const approveSupportResult = async (resultID) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 결과서 승인 이후에는 "현재 지원 사이클이 종료됐다"는 의미가 되므로
    // 1) 결과서 상태를 승인으로 바꾸고
    // 2) 같은 대상자의 신청서를 완료로 닫고
    // 3) priority 최신 상태를 미신청(none)으로 리셋해
    // 다음 신청 사이클을 다시 시작할 수 있게 만든다.
    let result = await conn.query(adminSql.approveSupportResult, [resultID]);
    await conn.query(adminSql.completeApplicationsByApprovedResult, [resultID]);
    await conn.query(adminSql.resetPriorityByApprovedResult, [resultID]);

    await conn.commit();
    return result;
  } catch (err) {
    console.log(err);
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const returnSupportResult = async (resultId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let result = await conn.query(adminSql.returnSupportResult, [resultId]);
    await conn.commit();
    return result;
  } catch (err) {
    console.log(err);
    if (conn) await conn.rollback();
    return { affectedRows: 0, error: err.message };
  } finally {
    if (conn) conn.release();
  }
};

const addResultRejectionHistory = async (insertDate) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      adminSql.addResultRejectionHistory,
      insertDate,
    );
    return rows;
  } catch (err) {
    console.error("이력 조회 중 오류:", err);
    return { error: err.message };
  } finally {
    if (conn) conn.release();
  }
};

//반려사유 리스트
const selectResultRejectionHistory = async (resultId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(adminSql.selectResultRejectionHistory, [
      resultId,
    ]);
    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const resultMappingHistory = async (historyId, resultId) => {
  let conn = await pool.getConnection();
  try {
    // 위에서 새로 만든 adminSql.copyResultMappingHistory 쿼리를 실행
    const result = await conn.query(adminSql.resultMappingHistory, [
      historyId,
      resultId,
    ]);
    return result;
  } finally {
    if (conn) conn.release();
  }
};

const selectResultMappingHistory = async (historyId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(adminSql.selectResultMappingHistory, [
      historyId,
    ]);
    return rows;
  } catch (err) {
    console.error("매핑 히스토리 상세 조회 중 오류:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  selectSupportPlanList,
  selectSupportPlanDetail,
  approveSupportPlan,
  returnSupportPlan,
  addRejectionHistory,
  selectRejectionHistory,
  selectBeneficiariesNames,
  selectSupportResultList,
  selectSupportResultDetail,
  approveSupportResult,
  returnSupportResult,
  addResultRejectionHistory,
  selectResultRejectionHistory,
  resultMappingHistory,
  selectResultMappingHistory,
  selectAttachments,
  selectResultAttachments,
};
