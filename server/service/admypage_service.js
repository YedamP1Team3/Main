const mapper = require("../database/mappers/admypage_mapper.js"); // 데이터를 물어다 줄 '배달부(매퍼)'를 불러옵니다.

module.exports = {
  // 1. [아이디로 관리자 찾기] 배달부가 가져온 명단에서 딱 1명만 골라냅니다.
  async findAdminById(userId) {
    const result = await mapper.getAdminInfo(userId);
    // 결과가 있고(result), 그 개수가 0보다 크면 첫 번째 사람(result[0])을 주고, 없으면 아무것도 안 줍니다(null).
    return result && result.length > 0 ? result[0] : null;
  },

  // 2. [비밀번호 확인] DB에서 가져온 비밀번호 뭉치에서 실제 비밀번호 칸만 쏙 뽑습니다.
  async checkPassword(userId) {
    const result = await mapper.checkPassword(userId);
    // DB 조회 결과는 보통 리스트 형태이므로, "이 아이디인 사람의 정보 객체" 하나만 반환합니다.
    return result && result.length > 0 ? result[0] : null;
  },

  // 3. [정보 수정] 배달부에게 수정할 데이터 뭉치를 넘겨주며 수정을 요청합니다.
  async modifyAdmin(data) {
    // 매퍼가 DB에 업데이트를 잘 마칠 때까지 기다렸다가 그 결과를 돌려줍니다.
    return await mapper.updateAdmin(data);
  },

  // 4. [비밀번호 변경] 아이디와 새 비밀번호를 매퍼에게 전달합니다.
  async modifyPassword(userId, newPassword) {
    // 암호화된 새 비밀번호가 DB에 무사히 저장되도록 배달부(매퍼)에게 일을 시킵니다.
    return await mapper.updatePassword(userId, newPassword);
  },
};
