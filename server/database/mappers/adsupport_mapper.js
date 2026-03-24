const { pool } = require("../DAO");
const userSql = require("../sql/adsupport.js");

const adSupportPlan_mapper = async (beneId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(userSql.adSupportPlan, [beneId]);
    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const adDetailSupportPlan = async (planId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(userSql.adDetailSupportPlan, [planId]);
    return rows[0];
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const updateApproval = async (planID) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(userSql.updateApproval, [planID]);
    await conn.commit();
    return result;
  } catch (err) {
    console.log(err);
    conn.rollback();
  } finally {
    if (conn) conn.release();
  }
};

const updateReturn = async (planId, planDate) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(userSql.updatereturn, [
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
  adSupportPlan_mapper,
  adDetailSupportPlan,
  updateApproval,
  updateReturn,
};
