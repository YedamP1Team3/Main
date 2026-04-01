const DAO = require("../DAO"); // DB에 실제로 접속해서 명령을 실행해주는 도구(DAO)를 가져옵니다.
const sql = require("../sql/mgmypage"); // 미리 작성해둔 SQL 문장(레시피)들이 담긴 파일을 가져옵니다.

class MgMyPageMapper {
  // 1. [조회] 담당자의 개인 프로필 정보를 DB에서 가져오는 기능입니다.
  async getManagerProfile(userId) {
    try {
      // DAO에게 "프로필 조회 SQL"을 실행하라고 시킵니다. 이때 누구의 정보인지 userId를 알려줍니다.
      const result = await DAO.execute(sql.getManagerProfile, [userId]);

      // 결과가 리스트(Array) 형태로 나오는데, 한 사람의 정보만 필요하므로 첫 번째([0]) 데이터만 꺼내 보냅니다.
      return result[0];
    } catch (error) {
      // 만약 DB에서 정보를 가져오다가 사고(에러)가 나면 어디서 났는지 일기(로그)를 남깁니다.
      console.error("Mapper Error (getManagerProfile):", error);
      throw error; // 에러를 밖(Service)으로 던져서 문제가 있음을 알립니다.
    }
  }

  // 2. [통계] 담당자가 처리한 업무들(지원서, 상담 등)의 개수를 가져오는 기능입니다.
  async getTaskStats(managerId) {
    try {
      // SQL 문장 안에 물음표(?)가 4개 있어서, 담당자 ID를 똑같이 4번 배달해줍니다.
      const result = await DAO.execute(sql.getTaskStats, [
        managerId,
        managerId,
        managerId,
        managerId,
      ]);

      // 통계는 여러 종류(지원서 몇 개, 상담 몇 개 등)이므로 리스트 전체를 그대로 반환합니다.
      return result;
    } catch (error) {
      console.error("Mapper Error (getTaskStats):", error);
      throw error;
    }
  }

  // 3. [수정] 사용자가 수정한 새로운 정보를 DB 창고에 덮어쓰는 기능입니다.
  async updateManagerProfile(userData) {
    try {
      // Service에서 보내준 택배 상자(userData)를 열어서 각 항목을 변수에 나눠 담습니다. (구조 분해 할당)
      const {
        user_name, // 이름
        email, // 이메일
        tel, // 전화번호
        postcode, // 우편번호
        address, // 주소
        detailAddress, // 상세주소
        password, // 암호화된 비밀번호 (Hash)
        userId, // 누구의 정보를 바꿀지 결정하는 기준 ID
      } = userData;

      // DAO에게 "업데이트 SQL"을 실행하라고 시킵니다.
      // SQL 문장의 물음표(?) 순서와 아래 배열 안의 데이터 순서가 반드시 일치해야 합니다.
      const result = await DAO.execute(sql.updateManagerProfile, [
        user_name,
        email,
        tel,
        postcode,
        address,
        detailAddress,
        password,
        userId, // WHERE user_id = ? 자리에 들어갈 값입니다.
      ]);

      return result; // 수정이 몇 건 되었는지 등의 결과 보고서를 반환합니다.
    } catch (error) {
      console.error("Mapper Error:", error);
      throw error;
    }
  }
}

// 이 파일을 다른 곳(Service)에서 `require`해서 바로 사용할 수 있도록 객체로 만들어 내보냅니다.
module.exports = new MgMyPageMapper();
