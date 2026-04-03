const mapper = require("../database/mappers/adapphistory_mapper.js");

const adapphistory_service = {
  fetchJoinRequests: async () => {
    try {
      const rows = await mapper.getJoinRequests();
      return { success: true, data: rows || [] };
    } catch (error) {
      console.error("Service Error (fetchJoinRequests):", error);
      return { success: false, message: "내역을 불러오지 못했습니다." };
    }
  },

  activeUser: async (userId) => {
    try {
      const result = await mapper.updateJoinStatus(userId, "ACTIVE");
      return { success: result.affectedRows > 0 };
    } catch (error) {
      console.error("Service Error (activeUser):", error);
      return { success: false, message: "승인 처리 중 오류 발생" };
    }
  },

  // 반려 처리 추가
  rejectUser: async (userId) => {
    try {
      const result = await mapper.updateJoinStatus(userId, "REJECTED");
      return { success: result.affectedRows > 0 };
    } catch (error) {
      console.error("Service Error (rejectUser):", error);
      return { success: false, message: "반려 처리 중 오류 발생" };
    }
  },
};

module.exports = adapphistory_service;
