const { pool } = require("../DAO.js");
const userSql = require("../sql/info.js");

// 회원 정보 등록 (회원가입)
const insertUser = async (userDataArray) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    // MariaDB/MySQL pool.query는 [results, fields]를 반환하므로 result를 그대로 반환
    let result = await conn.query(userSql.insertUser, userDataArray);
    return result;
  } catch (err) {
    console.error("Mapper insertUser Error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 아이디로 회원 정보 조회
const selectUserById = async (userId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(userSql.selectUserById, [userId]);
    return rows[0];
  } catch (err) {
    console.error("Mapper selectUserById Error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// ✅ 아이디 중복 체크용 카운트 (수정 완료)
const countUserId = async (userId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();

    // ✅ 테이블명을 user_info로 수정했습니다.
    const sql = "SELECT COUNT(*) as count FROM user_info WHERE user_id = ?";

    const rows = await conn.query(sql, [userId]);

    // MariaDB 결과값 처리: rows[0].count 또는 rows[0]['COUNT(*)']
    // 결과 객체를 로그로 찍어 확인해보면 더 정확합니다.
    console.log("DB 조회 결과:", rows[0]);

    return Number(rows[0].count);
  } catch (err) {
    console.error("Mapper countUserId Error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  insertUser,
  selectUserById,
  countUserId,
};
