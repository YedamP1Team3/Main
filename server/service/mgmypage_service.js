const mgMyPageMapper = require("../database/mappers/mgmypage_mapper");

class MgMyPageService {
  // 1. 조회 로직
  async getMyPageData(userId) {
    try {
      const profile = await mgMyPageMapper.getManagerProfile(userId);
      const rawStats = await mgMyPageMapper.getTaskStats(userId);

      if (!profile) {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }

      const formattedStats = this.formatTaskStats(rawStats);

      return {
        profile,
        taskStats: formattedStats,
      };
    } catch (error) {
      console.error("Service Error:", error);
      throw error;
    }
  }

  // 2. 수정 로직 (클래스 내부로 정상 이동 및 오타 수정)
  async updateMyPageData(userData) {
    try {
      const result = await mgMyPageMapper.updateManagerProfile(userData);

      if (result.affectedRows === 0) {
        throw new Error("수정된 정보가 없습니다. ID를 확인해주세요.");
      }
      return { success: true, message: "정보가 성공적으로 수정되었습니다." };
    } catch (error) {
      console.error("Service Error (updateMyPageData):", error);
      throw error;
    }
  }

  // 3. 통계 데이터 포맷팅 로직
  formatTaskStats(rawStats) {
    const categories = ["지원서", "상담일지", "지원계획서", "지원결과서"];
    const colors = {
      지원서: ["red", "yellow", "green", "blue"],
      상담일지: ["red", "blue"],
      지원계획서: ["red", "yellow", "blue"],
      지원결과서: ["red", "yellow", "green", "blue"],
    };

    return categories.map((title) => {
      const statsForCategory = (rawStats || [])
        .filter((item) => item.title === title)
        .map((item) => ({
          label: item.label,
          value: item.value,
        }));

      const total = statsForCategory.reduce((sum, item) => sum + item.value, 0);

      return {
        title,
        total,
        stats: statsForCategory,
        colors: colors[title] || ["blue"],
      };
    });
  }
}

module.exports = new MgMyPageService();
