const { pool } = require("../DAO");
const beneficiarySql = require("../sql/beneficiary.js");

const beneficiaryMapper = {
  // 대상자 정보 DB 저장
  insertBeneficiary: async (dataArray) => {
    let conn = null;
    try {
      conn = await pool.getConnection();
      const [result] = await conn.query(
        beneficiarySql.insertBeneficiary,
        dataArray,
      );
      return result;
    } catch (err) {
      console.error("Mapper insertBeneficiary Error:", err);
      throw err;
    } finally {
      if (conn) conn.release();
    }
  },
};

module.exports = beneficiaryMapper;
