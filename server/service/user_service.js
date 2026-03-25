const userMapper = require("../database/mappers/user_mapper.js");
const bcrypt = require("bcrypt");

//전체 회원조회
const findAll = async () => {
  let list = await userMapper.selectAllUser();
  return list;
};

//지원자 조회
const BeneficiaryList = async (managerId) => {
  const list = await userMapper.selectBeneficiaryList(managerId);
  return list || [];
};
//지원제 상세조회
const BeneficiaryDetail = async (id) => {
  const detail = await userMapper.selectBeneficiaryById(id);
  return detail || null;
};

const SupportPlan = async (beneId) => {
  let list = await userMapper.selectSupportPlan(beneId);
  return list || [];
};

const InsertSupportPlan = async (supportPlan) => {
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

  let result = await userMapper.insertSupportPlan(insertDate);

  let resObj = {
    status: result.insertId > 0 ? "success" : "fail",
    user_no: result.insertId,
  };
  return resObj;
};

const provisionalPlan = async (beneId) => {
  let list = await userMapper.provisionalPlan(beneId);
  return list || [];
};

const DetailSupportPlanService = async (planID) => {
  let list = await userMapper.DetailSupportPlan(planID);
  return list || {};
};

const deleteSupportPlanService = async (planDelete) => {
  let result = await userMapper.deleteSupportPlan(planDelete);
  let resObj = {
    status: result.affectedRows > 0 ? "success" : "fail",
    plan_no: planDelete,
  };
  return resObj;
};

const UpdateSupportPlanService = async (planId, planDate) => {
  let result = await userMapper.UpdateSupportPlan(planId, planDate);
  let resObj = {
    status: result.affectedRows > 0,
    target: {
      plan_no: planId,
      ...planDate,
    },
  };
  return resObj;
};

const provisionalUpdate = async (planId, planDate) => {
  let result = await userMapper.provisionalUpdate(planId, planDate);
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
  BeneficiaryList,
  BeneficiaryDetail,
  SupportPlan,
  InsertSupportPlan,
  provisionalPlan,
  DetailSupportPlanService,
  deleteSupportPlanService,
  UpdateSupportPlanService,
  provisionalUpdate,
};
