//실제 SQL문을 수행
const { pool } = require("../DAO");
const noTouch = require("../sql/noTouch.js");

//지원자정보
const selectBeneList = async () => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(noTouch.BeneList);
    return rows;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
//지원자정보 상세조회
const BeneById = async (id) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(noTouch.BeneById, [id]);
    return rows[0];
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 1. 담당자 목록 가져오기
const selectManagers = async () => {
  conn = await pool.getConnection();
  let rows = await conn.query(noTouch.getManagers);
  return rows;
};

// 2. 담당자 배정 업데이트
const updateManager = async (bene_id, manager_id) => {
  conn = await pool.getConnection();
  let result = await conn.query(noTouch.updateManagerAssign, [
    manager_id,
    bene_id,
  ]);
  return result;
};
module.exports = {
  selectBeneList,
  BeneById,
  selectManagers,
  updateManager,
};
