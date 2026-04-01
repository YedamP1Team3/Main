const DAO = require("../DAO");
const sql = require("../../database/sql/mgtargets");

class MgTargetsMapper {
  // 담당 지원자 목록 조회
  async getList(userId, limit, offset) {
    try {
      return await DAO.execute(sql.getMgTargetList, [userId, limit, offset]);
    } catch (error) {
      console.error("Mapper Error (getList:", error);
      throw error;
    }
  }

  // 전체 개수 조회
  async getTotal(userId) {
    try {
      const result = await DAO.execute(sql.getMgTargetCount, [userId]);
      return result[0].total;
    } catch (error) {
      console.error("Mapper Error (getTotal):", error);
      throw error;
    }
  }
}

module.exports = new MgTargetsMapper();
