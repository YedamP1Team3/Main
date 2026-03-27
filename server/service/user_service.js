const userMapper = require("../database/mappers/user_mapper.js");

//전체 회원조회
const findAll = async () => {
  let list = await userMapper.selectAllUser();
  return list;
};

//지원자 조회
const getBeneficiariesNames = async (managerId) => {
  const list = await userMapper.selectBeneficiariesNames(managerId);
  return list || [];
};
//지원제 상세조회
const getBeneficiariesDetail = async (id) => {
  const detail = await userMapper.selectBeneficiariesDetail(id);
  return detail || null;
};
//지원자의 지원계획서
const getSupportPlanList = async (beneId) => {
  let list = await userMapper.selectSupportPlanList(beneId);
  return list || [];
};
//지원계획서 생성
const createSupportPlan = async (supportPlan) => {
  const {
    priority_id,
    manager_id,
    bene_id,
    plan_objective,
    plan_content,
    progress_state,
  } = supportPlan;
  let insertDate = [
    priority_id,
    manager_id,
    bene_id,
    plan_objective,
    plan_content,
    progress_state,
  ];

  let result = await userMapper.createSupportPlan(insertDate);

  let resObj = {
    status: result.insertId > 0 ? "success" : "fail",
    user_no: result.insertId,
  };
  return resObj;
};
//지원계획서 임시 조회
const getSupportPlanTempList = async (beneId) => {
  let list = await userMapper.selectSupportPlanTempList(beneId);
  return list || [];
};
//지원계획서상세조회
const getSupportPlanDetail = async (planID) => {
  let list = await userMapper.selectSupportPlanDetail(planID);
  return list || {};
};
//지원계획서삭제
const removeSupportPlan = async (planDelete) => {
  let result = await userMapper.removeSupportPlan(planDelete);
  let resObj = {
    status: result.affectedRows > 0 ? "success" : "fail",
    plan_no: planDelete,
  };
  return resObj;
};
//지원계획서승인신청
const applySupportPlan = async (planId, planDate) => {
  let result = await userMapper.applySupportPlan(planId, planDate);
  let resObj = {
    status: result.affectedRows > 0,
    target: {
      plan_no: planId,
      ...planDate,
    },
  };
  return resObj;
};
//지원계획서업데이트(임시)
const updateTempPlan = async (planId, planDate) => {
  let result = await userMapper.updateTempPlan(planId, planDate);
  let resObj = {
    status: result.affectedRows > 0,
    target: {
      plan_no: planId,
      ...planDate,
    },
  };
  return resObj;
};

module.exports = {
  findAll,
  getBeneficiariesNames,
  getBeneficiariesDetail,
  getSupportPlanList,
  createSupportPlan,
  getSupportPlanTempList,
  getSupportPlanDetail,
  removeSupportPlan,
  applySupportPlan,
  updateTempPlan,
};
