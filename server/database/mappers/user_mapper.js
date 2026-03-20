//실제 SQL문을 수행
const { pool } = require("../DAO");
const userSql = require("../sql/user.js");

const selectAllUser = async () => {
  let conn = null;
  try {
    conn = await pool.getConnection();

    let [rows, fields] = await conn.query(userSql.selectAllUser);
    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

//지원자정보
const selectBeneficiaryList = async () => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let [rows] = await conn.query(userSql.BeneficiaryList);
    return rows;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
//지원자정보 상세조회
const selectBeneficiaryById = async (id) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let [rows] = await conn.query(userSql.BeneficiaryById, [id]);
    return rows[0];
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
//지원계획서 해당아이디 조회
const selectSupportPlan = async (beneId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let [rows] = await conn.query(userSql.SupportPlan, [beneId]);
    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  selectAllUser,
  selectBeneficiaryList,
  selectBeneficiaryById,
  selectSupportPlan,
};
