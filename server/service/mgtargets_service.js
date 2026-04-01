const mapper = require("../database/mappers/mgtargets_mapper");

class MgTargetsService {
  async getManageListData(userId, page) {
    const limit = 10; // 한 페이지당 10명
    const offset = (page - 1) * limit;

    try {
      const list = await mapper.getList(userId, limit, offset);
      const total = await mapper.getTotal(userId);

      return {
        list,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error("Service Error:", error);
      throw error;
    }
  }
}

module.exports = new MgTargetsService();
