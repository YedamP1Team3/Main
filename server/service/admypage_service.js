const mapper = require("../database/mappers/admypage_mapper.js");

module.exports = {
  async findAdminById(userId) {
    const result = await mapper.getAdminInfo(userId);
    return result && result.length > 0 ? result[0] : null;
  },

  // 추가해야 할 함수들
  async checkPassword(userId) {
    const result = await mapper.checkPassword(userId);
    return result && result.length > 0 ? result[0] : null; // 객체 반환
  },

  async modifyAdmin(data) {
    return await mapper.updateAdmin(data);
  },

  async modifyPassword(userId, newPw) {
    return await mapper.updatePassword(userId, newPw);
  },
};
