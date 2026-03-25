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

const ReturnMapper = async (planId, planDate) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(adminSql.Return, [
      planDate.rejection_reason,
      planId,
    ]);
    await conn.commit();
    return result;
  } catch (err) {
    console.log(err);
    conn.rollback();
    return { affectedRows: 0, error: err.message };
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  AdSupportPlanMapper,
  AdDetailSupportPlanMapper,
  ApprovalChangeMapper,
  ReturnMapper,
};
