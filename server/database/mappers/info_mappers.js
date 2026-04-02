const { pool } = require("../DAO.js"); // 여러 명이 동시에 DB를 써도 줄을 잘 서게 도와주는 '대기열(Pool)'을 가져옵니다.
const userSql = require("../sql/info.js"); // 미리 적어둔 SQL 명령어(대본)들을 가져옵니다.

// 1. [등록] 신규 회원의 정보를 DB에 한 줄 추가합니다.
const insertUser = async (userDataArray) => {
  let conn = null; // DB 연결 통로를 담을 변수를 미리 만듭니다.
  try {
    conn = await pool.getConnection(); // 대기열에서 연결 통로를 하나 빌려옵니다.
    // 준비한 SQL 문장에 회원 정보를 담은 배열(userDataArray)을 넣어 실행합니다.
    let result = await conn.query(userSql.insertUser, userDataArray);
    return result; // 실행 결과(성공 여부 등)를 돌려줍니다.
  } catch (err) {
    console.error("Mapper insertUser Error:", err);
    throw err; // 에러가 나면 호출한 쪽에 알립니다.
  } finally {
    if (conn) conn.release(); // [중요] 작업이 성공하든 실패하든, 빌린 통로는 반드시 반납합니다.
  }
};

// 2. [조회] 아이디를 가지고 해당 회원의 상세 정보를 찾아옵니다.
const selectUserById = async (userId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    // 아이디를 조건으로 검색을 실행합니다.
    const rows = await conn.query(userSql.selectUserById, [userId]);
    // 검색 결과의 첫 번째 데이터만 꺼내서 돌려줍니다.
    return rows[0];
  } catch (err) {
    console.error("Mapper selectUserById Error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 3. [중복체크] 같은 아이디를 쓰는 사람이 몇 명인지 숫자를 셉니다.
const countUserId = async (userId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    // COUNT(*) 기능을 써서 일치하는 아이디 개수를 가져옵니다.
    const sql = "SELECT COUNT(*) as count FROM user_info WHERE user_id = ?";
    const rows = await conn.query(sql, [userId]);

    console.log("DB 조회 결과:", rows[0]); // 터미널에서 숫자가 잘 나오는지 확인용
    return Number(rows[0].count); // 찾아낸 숫자(0 또는 1)를 결과로 줍니다.
  } catch (err) {
    console.error("Mapper countUserId Error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 4. [수정 - 비번 제외] 비밀번호를 안 바꿀 때 사용하는 수정 기능입니다.
const updateUser = async (updateDataArray) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    // 비밀번호 컬럼은 건드리지 않고 이름, 연락처 등만 업데이트합니다.
    const sql =
      "UPDATE user_info SET user_name=?, tel=?, email=?, zip_code=?, address=?, detail_address=? WHERE user_id=?";
    const result = await conn.query(sql, updateDataArray);
    return result;
  } catch (err) {
    console.error("Mapper updateUser Error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 5. [수정 - 비번 포함] 비밀번호까지 새로 바꿀 때 사용하는 기능입니다.
const updateUserWithPassword = async (updateDataArray) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    // SET 부분에 password=? 가 추가되어 비밀번호까지 함께 덮어씁니다.
    const sql =
      "UPDATE user_info SET user_name=?, tel=?, email=?, zip_code=?, address=?, detail_address=?, password=? WHERE user_id=?";
    const result = await conn.query(sql, updateDataArray);
    return result;
  } catch (err) {
    console.error("Mapper updateUserWithPassword Error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 6. [기관 목록 조회] DB의 기관 테이블에서 모든 데이터를 가져옵니다.
const selectAllAgencies = async () => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    // 기관 테이블(agencies)에서 ID와 이름을 가져오는 SQL입니다.
    // 테이블명이나 컬럼명이 다를 경우 본인의 DB에 맞춰 수정하세요.
    const sql = "SELECT id, agency_name FROM agencies ORDER BY agency_name ASC";
    const rows = await conn.query(sql);
    return rows; // 전체 목록(배열)을 반환합니다.
  } catch (err) {
    console.error("Mapper selectAllAgencies Error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const selectAgenciesByRegion = async (region) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const sql = require("../sql/info.js").selectAgenciesByRegion;
    const rows = await conn.query(sql, [region]);
    return rows;
  } catch (err) {
    console.error("Mapper selectAgenciesByRegion Error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 이 모든 기능들을 묶어서 밖으로 내보냅니다.
module.exports = {
  insertUser,
  selectUserById,
  countUserId,
  updateUser,
  updateUserWithPassword,
  selectAllAgencies,
  selectAgenciesByRegion,
};
