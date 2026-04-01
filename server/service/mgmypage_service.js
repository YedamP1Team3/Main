const mgMyPageMapper = require("../database/mappers/mgmypage_mapper"); // 창고지기(Mapper)를 불러옵니다.
const bcrypt = require("bcrypt"); // 비밀번호를 안전하게 으깨주는(암호화) 도구를 가져옵니다.

class MgMyPageService {
  // 1. [데이터 조회] 마이페이지에 필요한 모든 정보를 모아서 가져오는 로직입니다.
  async getMyPageData(userId) {
    try {
      // 매퍼에게 "이 사용자 프로필이랑 통계 좀 가져와줘"라고 시킵니다.
      const profile = await mgMyPageMapper.getManagerProfile(userId);
      const rawStats = await mgMyPageMapper.getTaskStats(userId);

      // 만약 가져온 프로필이 없다면 "사용자 없는데?"라고 에러를 냅니다.
      if (!profile) {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }

      // 날것의 통계 데이터를 화면에 그리기 좋은 예쁜 모양으로 다듬습니다. (밑에 3번 함수 참고)
      const formattedStats = this.formatTaskStats(rawStats);

      // 잘 정돈된 프로필과 통계 데이터를 한 봉투에 담아 라우터로 돌려보냅니다.
      return {
        profile,
        taskStats: formattedStats,
      };
    } catch (error) {
      console.error("Service Error:", error);
      throw error;
    }
  }

  // 2. [정보 수정] 사용자의 개인정보를 수정하는 핵심 로직입니다. (비밀번호 보안 포함!)
  async updateMyPageData(userData) {
    try {
      // [STEP 1] 사용자가 새 비밀번호 칸에 글자를 입력했는지 확인합니다.
      if (userData.newPassword && userData.newPassword.trim() !== "") {
        // --- [상황 A: 비밀번호를 바꾸고 싶을 때] ---
        const saltRounds = 10; // 암호화 강도 설정 (숫자가 높을수록 더 잘게 으깹니다)

        // 입력한 '평문' 비밀번호를 bcrypt로 으깨서 '해시(Hash)'값으로 변신시켜 저장합니다.
        userData.password = await bcrypt.hash(userData.newPassword, saltRounds);
      } else {
        // --- [상황 B: 이름/이메일만 바꾸고 비밀번호는 그대로 두고 싶을 때] ---
        // DB 창고에 가서 지금 이 사람의 비밀번호(해시값)가 무엇인지 먼저 알아냅니다.
        const currentProfile = await mgMyPageMapper.getManagerProfile(
          userData.userId,
        );

        if (!currentProfile) {
          throw new Error(
            "사용자 정보를 찾을 수 없어 비밀번호를 유지할 수 없습니다",
          );
        }

        // DB에 있던 옛날 비밀번호(해시)를 그대로 꺼내서 다시 넣어줍니다. (비지 않도록!)
        userData.password = currentProfile.password;
      }

      // [STEP 2] 이제 수정할 데이터(새 비번 혹은 옛날 비번 포함)가 준비됐으니 매퍼에게 전달합니다.
      const result = await mgMyPageMapper.updateManagerProfile(userData);

      // [STEP 3] DB에 물어봐서 "한 줄도 안 바뀌었는데?"라고 하면 문제가 있는 것입니다.
      if (result.affectedRows === 0) {
        throw new Error("수정된 정보가 없습니다. ID를 확인해주세요");
      }

      // [STEP 4] 모든 과정이 성공하면 라우터에게 성공 메시지를 보냅니다.
      return { success: true, message: "정보가 성공적으로 수정되었습니다." };
    } catch (error) {
      console.error("Service Error (updateMyPageData):", error);
      throw error;
    }
  }

  // 3. [데이터 가공] DB에서 가져온 복잡한 통계 숫자를 화면(Vue)이 이해하기 쉽게 정리하는 곳입니다.
  formatTaskStats(rawStats) {
    // 우리가 보여줄 4가지 카테고리를 미리 정합니다.
    const categories = ["지원서", "상담일지", "지원계획서", "지원결과서"];
    const colors = {
      지원서: ["red", "yellow", "green", "blue"],
      상담일지: ["red", "blue"],
      지원계획서: ["red", "yellow", "blue"],
      지원결과서: ["red", "yellow", "green", "blue"],
    };

    // 카테고리를 하나씩 돌면서 데이터를 정리합니다.
    return categories.map((title) => {
      // 전체 데이터 중에 해당 카테고리(예: '지원서') 이름이 붙은 것만 골라냅니다.
      const statsForCategory = (rawStats || [])
        .filter((item) => item.title === title)
        .map((item) => ({
          label: item.label, // 예: '제출완료'
          value: item.value, // 예: 5건
        }));

      // 이 카테고리의 모든 수치를 합산해 전체 건수(total)를 구합니다.
      const total = statsForCategory.reduce((sum, item) => sum + item.value, 0);

      // 화면에서 쓰기 좋게 가공된 묶음(객체)을 반환합니다.
      return {
        title, // 제목
        total, // 총 개수
        stats: statsForCategory, // 세부 항목
        colors: colors[title] || ["blue"], // 지정된 색상
      };
    });
  }
}

module.exports = new MgMyPageService(); // 이 요리사를 다른 곳(Router)에서도 부를 수 있게 내보냅니다.
