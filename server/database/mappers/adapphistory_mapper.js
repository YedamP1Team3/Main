const { pool } = require("../DAO.js");
const historysql = require("../sql/adapphistory.js");

const adapphistory_mapper = {
  getJoinRequests: async () => {
    let conn = null;
    try {
      conn = await pool.getConnection();
      const rows = await conn.query(historysql.selecthistory);
      return rows;
    } catch (err) {
      console.error("Mapper Error (getJoinRequests):", err);
      throw err;
    } finally {
      if (conn) conn.end();
    }
  },

  updateJoinStatus: async (userId, status) => {
    let conn = null;
    try {
      conn = await pool.getConnection();
      const result = await conn.query(historysql.updatehistory, [
        status,
        userId,
      ]);
      return result;
    } catch (err) {
      console.error("Mapper Error (updateJoinStatus):", err);
      throw err;
    } finally {
      if (conn) conn.end();
    }
  },

  deleteUser: async (userId) => {
    let conn = null;
    try {
      conn = await pool.getConnection();
      const result = await conn.query(historysql.deletehistory, [userId]);
      return result;
    } catch (err) {
      console.error("Mapper Error (deleteUser):", err);
      throw err;
    } finally {
      if (conn) conn.end();
    }
  },
};

module.exports = adapphistory_mapper;
