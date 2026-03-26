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

module.exports = {
  resultListMapper,
  saveResultListMapper,
  newResultMapper,
  supportListMapper,
};
