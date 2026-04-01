const DAO = require("../DAO"); // 실제로 DB에 명령을 전달하고 결과를 받아오는 '실행 요원'을 불러옵니다.
const sql = require("../sql/admypage.js"); // 아까 작성한 SQL 명령어 뭉치(대본)를 가져옵니다.

module.exports = {
  // 1. [조회 배달] 특정 사용자의 아이디를 들고 가서 상세 정보를 받아옵니다.
  async getAdminInfo(userId) {
    // DAO에게 'getAdminInfo' 쿼리와 'userId'를 전달하며 실행을 부탁합니다.
    return await DAO.execute(sql.getAdminInfo, [userId]);
  },

  // 2. [비번 확인 배달] 본인 확인을 위해 DB에 저장된 비밀번호를 가져오라고 시킵니다.
  async checkPassword(userId) {
    // 결과값은 배열 형태([])로 돌아오게 됩니다.
    return await DAO.execute(sql.checkPassword, [userId]);
  },

  // 3. [정보 수정 배달] 수정된 여러 가지 정보들을 SQL의 물음표(?) 순서에 맞게 나열합니다.
  async updateAdmin(data) {
    // [중요] SQL 문장의 ? 순서(이름, 전화번호, 이메일...)와 아래 배열의 순서가 반드시 일치해야 합니다!
    return await DAO.execute(sql.updateAdminInfo, [
      data.user_name, // 1번째 ? : 이름
      data.tel, // 2번째 ? : 전화번호
      data.email, // 3번째 ? : 이메일
      data.zip_code, // 4번째 ? : 우편번호
      data.address, // 5번째 ? : 주소
      data.detail_address, // 6번째 ? : 상세주소
      data.user_id, // 7번째 ? : (WHERE 절) 누구를 수정할지 결정하는 아이디
    ]);
  },

  // 4. [비번 변경 배달] 새 비밀번호와 아이디를 세트로 묶어서 전달합니다.
  async updatePassword(userId, newPassword) {
    // 첫 번째 ?에는 새 비밀번호를, 두 번째 ?에는 사용자 아이디를 넣습니다.
    return await DAO.execute(sql.updateAdminPassword, [newPassword, userId]);
  },
};
