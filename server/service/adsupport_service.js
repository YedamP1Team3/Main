const adminMapper = require("../database/mappers/adsupport_mapper.js");

const AdSupportPlanService = async (beneId) => {
  let list = await adminMapper.AdSupportPlanMapper(beneId);
  return list || [];
};

const AdDetailSupportPlanService = async (planID) => {
  let list = await adminMapper.AdDetailSupportPlanMapper(planID);
  return list || {};
};

const ApprovalChangeService = async (planID) => {
  let result = await adminMapper.ApprovalChangeMapper(planID);
  let resObj = {
    status: result.affectedRows > 0,
  };
  return resObj;
};

const ReturnService = async (planId, planDate) => {
  let result = await adminMapper.ReturnMapper(planId, planDate);
  let resObj = {
    status: result.affectedRows > 0,
    target: {
      plan_no: planId,
      planDate,
    },
  };
  return resObj;
};

const AdSupportListService = async (agencyId) => {
  let conn = null;
  try {
    let list = await adminMapper.AdSupportListMapper(agencyId);
    return list || [];
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  AdSupportPlanService,
  AdDetailSupportPlanService,
  ApprovalChangeService,
  ReturnService,
  AdSupportListService,
};
