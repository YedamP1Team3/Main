//실제 SQL문을 수행
const { pool } = require("../DAO");
const surveySql = require("../sql/servey.js");

const selectSurvey = async () => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    // [ ]를 제거하고 결과 전체를 받습니다.
    let rows = await conn.query(surveySql.selectSurvey);

    console.log("DB Raw Data:", rows);
    return rows;
  } catch (err) {
    console.error("Mapper Error:", err);
    throw err; // 에러를 Service로 던져서 처리하게 함
  } finally {
    if (conn) conn.release();
  }
};
module.exports = {
  selectSurvey,
};
