const { pool } = require("../DAO.js");
const rsvSql = require("../sql/rsv.js");

const selectManagerSchedule = async (managerId, date) => {
  let conn = null;
  try {
    conn = await pool.getConnection();

    let rows = await conn.query(rsvSql.selectManagerSchedule, [
      managerId,
      date,
    ]);

    // 단건 조회니까 첫 번째 데이터만 반환
    return rows[0];
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const insertBlockedTime = async (managerId, date, startTime, endTime) => {
  let conn = null;
  try {
    conn = await pool.getConnection();

    await conn.query(rsvSql.insertBlockedTime, [
      managerId,
      date,
      startTime,
      endTime,
    ]);
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

module.exports = { selectManagerSchedule, insertBlockedTime };
