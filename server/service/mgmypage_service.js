// service/mgmypage_service.js
const mgMyPageMapper = require("../database/mappers/mgmypage_mapper");

class MgMyPageService {
  async getMyPageData(userId) {
    try {
      const profile = await mgMyPageMapper.getManagerProfile(userId);
      const rawStats = await mgMyPageMapper.getTaskStats(userId);

      // 데이터가 없을 경우를 대비한 방어 코드 추가
      if (!profile) {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }

      const formattedStats = this.formatTaskStats(rawStats);

      return {
        profile,
        taskStats: formattedStats,
      };
    } catch (error) {
      console.error("Service Error:", error); // 서버 터미널에 에러 출력
      throw error;
    }
  }

  formatTaskStats(rawStats) {
    const categories = ["지원서", "상담일지", "지원계획서", "지원결과서"];
    const colors = {
      지원서: ["red", "yellow", "green", "blue"],
      상담일지: ["red", "blue"],
      지원계획서: ["red", "yellow", "blue"],
      지원결과서: ["red", "yellow", "green", "blue"],
    };

    return categories.map((title) => {
      const statsForCategory = (rawStats || []) // rawStats가 없을 경우 빈 배열 처리
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
