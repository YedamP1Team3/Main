const rsvMapper = require("../database/mappers/rsv_mapper.js");

// 담당자 조회
const getManagerId = async (userId) => {
  const manager = await rsvMapper.findManagerByUserID(userId);

  return manager;
};

const getManagerSchedule = async (managerId) => {
  const schedule = await rsvMapper.findScheduleByManagerId(managerId);
  return schedule;
};

module.exports = { getManagerId, getManagerSchedule };
