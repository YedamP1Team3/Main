const DAO = require("../DAO");
const sql = require("../sql/admypage.js");

module.exports = {
  async getAdminInfo(userId) {
    // DAO의 execute 메서드로 SQL 쿼리 실행
    return await DAO.execute(sql.getAdminInfo, [userId]);
  },

  async checkPassword(userId) {
    return await DAO.execute(sql.checkPassword, [userId]);
  },

  async updateAdmin(data) {
    return await DAO.execute(sql.updateAdminInfo, [
      data.user_name,
      data.tel,
      data.email,
      data.zip_code,
      data.address,
      data.detail_address,
      data.user_id,
    ]);
  },

  async updatePassword(userId, newPw) {
    return await DAO.execute(sql.updateAdminPassword, [newPw, userId]);
  },
};
