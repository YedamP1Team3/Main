const userMapper = require("../database/mappers/adsupport_mapper.js");

const adSupportPlan_service = async (beneId) => {
  let list = await userMapper.adSupportPlan_mapper(beneId);
  return list || [];
};

const adDetailSupportPlanService = async (planID) => {
  let list = await userMapper.adDetailSupportPlan(planID);
  return list || {};
};

const updateApprovalService = async (planID) => {
  let result = await userMapper.updateApproval(planID);
  let resObj = {
    status: result.affectedRows > 0,
  };
  return resObj;
};

const updateReturnService = async (planId, planDate) => {
  let result = await userMapper.updateReturn(planId, planDate);
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
  adSupportPlan_service,
  adDetailSupportPlanService,
  updateApprovalService,
  updateReturnService,
};
