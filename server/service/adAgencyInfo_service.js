const adagencyinfo_mapper = require("../database/mappers/adAgencyInfo_mapper.js");

const adagencyinfo_service = {
  getCenterInfo: async (userId) => {
    console.log("현재 연결된 Mapper 객체:", adagencyinfo_mapper);
    try {
      const data = await adagencyinfo_mapper.getCenterInfo(userId);
      console.log("service 데이터 전송 에러:", data);

      return data || null;
    } catch (err) {
      console.error("service 조회 에러:", err);
      throw err;
    }
  },

  updateCenterInfo: async (agencyData) => {
    try {
      const isSuccess = await adagencyinfo_mapper.updateCenterInfo(agencyData);

      return { success: isSuccess };
    } catch (err) {
      console.error("Service 수정 에러:", err);
      throw err;
    }
  },
};

module.exports = adagencyinfo_service;
