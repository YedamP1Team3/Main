const { pool } = require("../DAO.js");
const dependentSql = require("../sql/Dependent.js");

const dependentMapper = {
  insertDependent: async (dataArray) => {
    let conn = null;
    try {
      conn = await pool.getConnection();
      const [result] = await conn.query(
        dependentSql.insertDependent,
        dataArray,
      );
      return result;
    } catch (err) {
      console.error("Mapper Error:", err);
      throw err;
    } finally {
      if (conn) conn.release();
    }
  },
};

module.exports = dependentMapper;
