const { pool } = require("../DAO");
const adminSql = require("../sql/adsupport.js");

const AdSupportPlanMapper = async (beneId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(adminSql.AdSupportPlan, [beneId]);
    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const AdDetailSupportPlanMapper = async (planId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(adminSql.AdDetailSupportPlan, [planId]);
    return rows[0];
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const ApprovalChangeMapper = async (planID) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(adminSql.ApprovalChange, [planID]);
    await conn.commit();
    return result;
  } catch (err) {
    console.log(err);
    conn.rollback();
  } finally {
    if (conn) conn.release();
  }
};

//반려 업데이트
const ReturnMapper = async (planId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let result = await conn.query(adminSql.Return, [planId]);
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
const rejectionHistoryMapper = async (insertDate) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(adminSql.rejectionHistory, insertDate);
    return rows;
  } catch (err) {
    console.error("이력 조회 중 오류:", err);
    return { error: err.message };
  } finally {
    if (conn) conn.release();
  }
};

//반려사유 리스트
const rejectionListMapper = async (planId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(adminSql.rejectionList, [planId]);
    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const AdSupportListMapper = async (agencyId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let row = await conn.query(adminSql.AdSupportList, [agencyId]);
    return row;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  AdSupportPlanMapper,
  AdDetailSupportPlanMapper,
  ApprovalChangeMapper,
  ReturnMapper,
  rejectionHistoryMapper,
  rejectionListMapper,
  AdSupportListMapper,
};
