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

  // ⭐ 3. 담당자 정보 수정 (클래스 내부로 이동 완료)
  async updateManagerProfile(userData) {
    try {
      // 위에서 정의한 updateData의 키값들과 일치해야 합니다.
      const {
        user_name,
        email,
        tel,
        postcode,
        address,
        detailAddress,
        userId, // id가 아니라 userId로 받아야 합니다.
      } = userData;

      const result = await DAO.execute(sql.updateManagerProfile, [
        user_name,
        email,
        tel,
        postcode,
        address,
        detailAddress,
        userId, // SQL WHERE 절의 ?에 들어갈 값
      ]);
      return result;
    } catch (error) {
      console.error("Mapper Error:", error);
      throw error;
    }
  }
} // <--- 클래스를 닫는 중괄호가 모든 함수 아래에 있어야 합니다.

module.exports = new MgMyPageMapper();
