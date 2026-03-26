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

const ReturnService = async (planId) => {
  let result = await adminMapper.ReturnMapper(planId);
  let resObj = {
    status: result.affectedRows > 0,
    target: {
      plan_no: planId,
    },
  };
  return resObj;
};

const rejectionHistoryService = async (data) => {
  const { plan_id, rejection_reason, manager_id } = data;
  let insertDate = [plan_id, rejection_reason, manager_id];

  let result = await adminMapper.rejectionHistoryMapper(insertDate);
  let resObj = {
    status: result.insertId > 0 ? "success" : "fail",
    user_no: result.insertId,
  };
  return resObj;
};

const rejectionListService = async (planId) => {
  let list = await adminMapper.rejectionListMapper(planId);
  return list || [];
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
  rejectionHistoryService,
  rejectionListService,
  AdSupportListService,
};
