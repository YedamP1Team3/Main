const adminMapper = require("../database/mappers/adsupport_mapper.js");

const getSupportPlanList = async (beneId) => {
  let list = await adminMapper.selectSupportPlanList(beneId);
  return list || [];
};

const getSupportPlanDetail = async (planID) => {
  let list = await adminMapper.selectSupportPlanDetail(planID);
  return list || {};
};

const approveSupportPlan = async (planID) => {
  let result = await adminMapper.approveSupportPlan(planID);
  let resObj = {
    status: result.affectedRows > 0,
  };
  return resObj;
};

const returnSupportPlan = async (planId) => {
  let result = await adminMapper.returnSupportPlan(planId);
  let resObj = {
    status: result.affectedRows > 0,
    target: {
      plan_no: planId,
    },
  };
  return resObj;
};

const addRejectionHistory = async (data) => {
  const { plan_id, rejection_reason, manager_id } = data;
  let insertDate = [plan_id, rejection_reason, manager_id];

  let result = await adminMapper.addRejectionHistory(insertDate);
  let resObj = {
    status: result.insertId > 0 ? "success" : "fail",
    user_no: result.insertId,
  };
  return resObj;
};

const getRejectionHistory = async (planId) => {
  let list = await adminMapper.selectRejectionHistory(planId);
  return list || [];
};

const getBeneficiariesNames = async (agencyId) => {
  let conn = null;
  try {
    let list = await adminMapper.selectBeneficiariesNames(agencyId);
    return list || [];
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  getSupportPlanList,
  getSupportPlanDetail,
  approveSupportPlan,
  returnSupportPlan,
  addRejectionHistory,
  getRejectionHistory,
  getBeneficiariesNames,
};
