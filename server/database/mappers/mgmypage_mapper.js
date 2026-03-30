// database/mappers/mgmypage_mapper.js
const DAO = require("../DAO");
const sql = require("../sql/mgmypage");

class MgMyPageMapper {
  // 1. 담당자 프로필 가져오기
  async getManagerProfile(userId) {
    try {
      const result = await DAO.execute(sql.getManagerProfile, [userId]);
      return result[0]; // 단일 행 반환
    } catch (error) {
      console.error("Mapper Error (getManagerProfile):", error);
      throw error;
    }
  }

  // 2. 업무 현황 통계 가져오기
  async getTaskStats(managerId) {
    try {
      // 모든 UNION ALL 결과를 가져오기 위해 동일한 ID를 4번 전달
      const result = await DAO.execute(sql.getTaskStats, [
        managerId,
        managerId,
        managerId,
        managerId,
      ]);
      return result;
    } catch (error) {
      console.error("Mapper Error (getTaskStats):", error);
      throw error;
    }
  }
}

module.exports = new MgMyPageMapper();
