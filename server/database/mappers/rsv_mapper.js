const { pool } = require("../DAO.js");
const rsvSql = require("../sql/rsv.js");

const findManagerByUserID = async (userId) => {
  let conn = null;

  try {
    conn = await pool.getConnection();

    const managers = await conn.query(rsvSql.selectManagerId, [userId]);
    return managers[0];
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const findScheduleByManagerId = async (managerId) => {
  let conn = null;

  try {
    conn = await pool.getConnection();

    const slots = await conn.query(rsvSql.selectManagerSchedule, [managerId]);

    return slots;
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = { findManagerByUserID, findScheduleByManagerId };
