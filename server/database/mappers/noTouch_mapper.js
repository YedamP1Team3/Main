// 실제 SQL문을 수행
const { pool } = require("../DAO");
const noTouch = require("../sql/noTouch.js");

// 1. 지원자정보 전체 조회
const selectBeneList = async () => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(noTouch.BeneList);
    return rows;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release(); // 사용 후 즉시 반납
  }
};

// 2. 지원자정보 상세조회
const BeneById = async (id) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(noTouch.BeneById, [id]);
    return rows[0];
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release(); // 사용 후 즉시 반납
  }
};

// 3. 담당자 목록 가져오기
const selectManagers = async () => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(noTouch.getManagers);
    return rows;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release(); // 사용 후 즉시 반납
  }
};

// 4. 담당자 배정 업데이트
const updateManager = async (bene_id, manager_id) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(noTouch.updateManagerAssign, [
      manager_id,
      bene_id,
    ]);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release(); // 사용 후 즉시 반납
  }
};

// 5. 대기단계 정보 조회
const prioList = async (bene_id) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(noTouch.priorityList, [bene_id]);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release(); // 사용 후 즉시 반납
  }
};

// 6. 대기단계 승인/재승인 요청 (UPSERT)
const prioPending = async (bene_id, priority_status) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(noTouch.priorityPending, [
      bene_id,
      priority_status,
      priority_status,
    ]);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release(); // 사용 후 즉시 반납
  }
};

// 7. 대기단계 신청 취소 (DELETE)
const prioCancel = async (bene_id) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(noTouch.priorityCancel, [bene_id]);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release(); // 사용 후 즉시 반납
  }
};

module.exports = {
  selectBeneList,
  BeneById,
  selectManagers,
  updateManager,
  prioList,
  prioPending,
  prioCancel,
};
