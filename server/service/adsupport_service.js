const adminMapper = require("../database/mappers/adsupport_mapper.js");
const MappingMapper = require("../database/mappers/result_mapper.js");

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

const getSupportResultList = async (beneId) => {
  let list = await adminMapper.selectSupportResultList(beneId);
  return list || [];
};

const getSupportResultDetail = async (resultId) => {
  let list = await adminMapper.selectSupportResultDetail(resultId);
  let planList = await MappingMapper.selectLinkedPlanList(resultId);
  if (list) {
    list.selected_plans = planList || [];
    return list;
  }
  return {};
};

const approveSupportResult = async (resultId) => {
  // 결과서 승인 시점은 "이번 지원 사이클 종료"로 본다.
  // 실제 연쇄 업데이트(신청서 완료, priority 미신청 리셋)는
  // mapper 트랜잭션 안에서 같이 처리해 중간 상태가 남지 않게 한다.
  let result = await adminMapper.approveSupportResult(resultId);
  let resObj = {
    status: result.affectedRows > 0,
  };
  return resObj;
};

const returnSupportResult = async (resultId) => {
  let result = await adminMapper.returnSupportResult(resultId);
  let resObj = {
    status: result.affectedRows > 0,
    target: {
      result_no: resultId,
    },
  };
  return resObj;
};

const addResultRejectionHistory = async (data) => {
  const { result_id, rejection_reason, manager_id } = data;
  let insertDate = [result_id, rejection_reason, manager_id];

  let result = await adminMapper.addResultRejectionHistory(insertDate);
  let resObj = {
    status: result.insertId > 0 ? "success" : "fail",
    user_no: result.insertId,
  };
  return resObj;
};

const getResultRejectionHistory = async (resultId) => {
  let list = await adminMapper.selectResultRejectionHistory(resultId);
  return list || [];
};

module.exports = {
  getSupportPlanList,
  getSupportPlanDetail,
  approveSupportPlan,
  returnSupportPlan,
  addRejectionHistory,
  getRejectionHistory,
  getBeneficiariesNames,
  getSupportResultList,
  getSupportResultDetail,
  approveSupportResult,
  returnSupportResult,
  addResultRejectionHistory,
  getResultRejectionHistory,
};
