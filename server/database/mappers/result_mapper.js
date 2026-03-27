const { pool } = require("../DAO");
const resultSql = require("../sql/result.js");

const resultListMapper = async (beneId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(resultSql.resultList, [beneId]);
    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const saveResultListMapper = async (beneId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(resultSql.saveResultList, [beneId]);
    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const newResultMapper = async (newResult) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(resultSql.newResult, newResult);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const listMappingMapper = async (mappingValues) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const result = await conn.batch(resultSql.listMapping, mappingValues);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const supportListMapper = async (beneId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(resultSql.supportList, [beneId]);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const detailResultPlanMapper = async (result) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(resultSql.detailResultPlan, [result]);
    return rows[0];
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const plusPlanListMapper = async (result) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(resultSql.plusPlanList, [result]);
    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const supportResultMapper = async (resultId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(resultSql.supportResult, resultId);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const deleteMappingMapper = async (resultId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(resultSql.deleteMapping, resultId);
    return result;
  } catch (err) {
    console.error("deleteMappingMapper 에러:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const updateResultPlanMapper = async (resultId, resultDate) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let result = await conn.query(resultSql.updateResultPlan, [
      resultDate.result_title,
      resultDate.result_content,
      resultId,
    ]);
    await conn.commit();
    return result;
  } catch (err) {
    console.error("updateResultPlanMapper 에러:", err);
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const updateSavePlanMapper = async (resultId, resultDate) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let result = await conn.query(resultSql.updateSavePlan, [
      resultDate.result_title,
      resultDate.result_content,
      resultId,
    ]);
    await conn.commit();
    return result;
  } catch (err) {
    console.error("updateResultPlanMapper 에러:", err);
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  resultListMapper,
  saveResultListMapper,
  newResultMapper,
  listMappingMapper,
  supportListMapper,
  detailResultPlanMapper,
  plusPlanListMapper,
  supportResultMapper,
  deleteMappingMapper,
  updateResultPlanMapper,
  updateSavePlanMapper,
};
