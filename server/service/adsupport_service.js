const userMapper = require("../database/mappers/adsupport_mapper.js");

const AdSupportPlanService = async (beneId) => {
  let list = await userMapper.AdSupportPlanMapper(beneId);
  return list || [];
};

const AdDetailSupportPlanService = async (planID) => {
  let list = await userMapper.AdDetailSupportPlanMapper(planID);
  return list || {};
};

const ApprovalChangeService = async (planID) => {
  let result = await userMapper.ApprovalChangeMapper(planID);
  let resObj = {
    status: result.affectedRows > 0,
  };
  return resObj;
};

const ReturnService = async (planId, planDate) => {
  let result = await userMapper.ReturnMapper(planId, planDate);
  let resObj = {
    status: result.affectedRows > 0,
    target: {
      plan_no: planId,
      planDate,
    },
  };
  return resObj;
};

module.exports = {
  AdSupportPlanService,
  AdDetailSupportPlanService,
  ApprovalChangeService,
  ReturnService,
};
