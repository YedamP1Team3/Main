// 회원 정보 등록 (회원가입)
const insertUser = async (userDataArray) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(userSql.insertUser, userDataArray);
    return result;
  } catch (err) {
    console.error("Mapper insertUser Error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 아이디로 회원 정보 조회(로그인 및 중복체크)
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

module.exports = {
  insertUser,
  selectUserById,
};
