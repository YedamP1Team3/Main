const mapper = require("../database/mappers/adAgency_mapper.js");

module.exports = {
  async findAgencyByAdminId(adminId) {
    const result = await mapper.getAgencyInfo(adminId);
    return result && result.length > 0 ? result[0] : null;
  },
  async modifyAgencyInfo(agencyData) {
    return await mapper.updateAgencyInfo(agencyData);
  },
};
