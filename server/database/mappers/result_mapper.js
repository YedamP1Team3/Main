const { pool } = require("../DAO");
const resultSql = require("../sql/result.js");

const selectSupportResultList = async (beneId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(resultSql.selectSupportResultList, [beneId]);
    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const selectSupportResultTempList = async (beneId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(resultSql.selectSupportResultTempList, [beneId]);
    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const createSupportResult = async (newResult) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(resultSql.createSupportResutl, newResult);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const insertMapping = async (mappingValues) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const result = await conn.batch(resultSql.insertMapping, mappingValues);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const selectApprovedPlanList = async (beneId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(resultSql.selectApprovedPlanList, [beneId]);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const selectSupportResultDetail = async (result) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(resultSql.selectSupportResultDetail, [result]);
    return rows[0];
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const selectLinkedPlanList = async (result) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(resultSql.selectLinkedPlanList, [result]);
    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const removeSupportResult = async (resultId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(resultSql.removeSupportResult, resultId);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const removeMapping = async (resultId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(resultSql.removeMapping, resultId);
    return result;
  } catch (err) {
    console.error("removeMapping 에러:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const applySupportResult = async (resultId, resultDate) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let result = await conn.query(resultSql.applySupportResult, [
      resultDate.result_title,
      resultDate.result_content,
      resultId,
    ]);
    await conn.commit();
    return result;
  } catch (err) {
    console.error("applySupportResult 에러:", err);
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const updateTempSupportResult = async (resultId, resultDate) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let result = await conn.query(resultSql.updateTempSupportResult, [
      resultDate.result_title,
      resultDate.result_content,
      resultId,
    ]);
    await conn.commit();
    return result;
  } catch (err) {
    console.error("updateTempSupportResult 에러:", err);
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  selectSupportResultList,
  selectSupportResultTempList,
  createSupportResult,
  insertMapping,
  selectApprovedPlanList,
  selectSupportResultDetail,
  selectLinkedPlanList,
  removeSupportResult,
  removeMapping,
  applySupportResult,
  updateTempSupportResult,
};
