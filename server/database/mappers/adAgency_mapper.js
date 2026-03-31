const DAO = require("../DAO");
const sql = require("../sql/adAgency.js");

module.exports = {
  async getAgencyInfo(adminId) {
    return await DAO.execute(sql.getAgencyInfo, [adminId]);
  },
  async updateAgencyInfo(agencyData) {
    const { agency_name, rep_tel, email, detail_address, agency_id } =
      agencyData;
    return await DAO.execute(sql.updateAgencyInfo, [
      agency_name,
      rep_tel,
      email,
      detail_address, // SQL의 4번째 ?(detail_address)에 매칭될 값을 추가했습니다.
      agency_id, // 마지막 ?(WHERE 조건)에 들어갈 ID입니다.
    ]);
  },
};
