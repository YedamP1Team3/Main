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

const createTempPlan = async (supportPlan) => {
  const {
    plan_draft_id,
    manager_id,
    bene_id,
    plan_objective,
    plan_content,
    progress_state,
  } = supportPlan;
  let insertDate = [
    plan_draft_id,
    manager_id,
    bene_id,
    plan_objective,
    plan_content,
    progress_state,
  ];

  let result = await userMapper.createTempPlan(insertDate);

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
//임시지원계획서조회
const getTempPlanDetail = async (planID) => {
  let list = await userMapper.selectTempPlanDetail(planID);
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

const removeTempPlan = async (planDelete) => {
  let result = await userMapper.removeTempPlan(planDelete);
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
const updateTempPlan = async (planDraftId, planDate) => {
  let result = await userMapper.updateTempPlan(planDraftId, planDate);
  let resObj = {
    status: result.affectedRows > 0,
    target: {
      plan_no: planDraftId,
      ...planDate,
    },
  };
  return resObj;
};

const approveTempPlan = async (target) => {
  try {
    // 1. 객체 구조 분해 할당 (target 객체에서 필요한 값들을 추출)
    const {
      plan_draft_id, // 삭제를 위해 필요
      priority_id, // 생성을 위해 필요
      manager_id,
      bene_id,
      plan_objective,
      plan_content,
      progress_state,
    } = target;
    const insertData = [
      priority_id,
      manager_id,
      bene_id,
      plan_objective,
      plan_content,
      progress_state,
    ];
    // 3. 정식 지원계획서 생성 수행
    const createResult = await userMapper.createSupportPlan(insertData);

    // 4. 생성이 성공(affectedRows > 0)했다면, 임시 저장본 삭제 수행
    if (createResult && createResult.affectedRows > 0) {
      if (plan_draft_id) {
        await userMapper.removeTempPlan(plan_draft_id);
      }
    }

    return {
      status: "success",
      message: "승인 신청 및 임시 데이터 삭제가 완료되었습니다.",
    };
  } catch (err) {
    console.error("승인 처리 서비스 에러:", err);
    // 에러 발생 시 컨트롤러(라우터)로 에러를 던지거나 에러 객체 반환
    return {
      status: "error",
      message: "승인 처리 중 오류가 발생했습니다.",
    };
  }
};

module.exports = {
  findAll,
  getBeneficiariesNames,
  getBeneficiariesDetail,
  getSupportPlanList,
  createSupportPlan,
  createTempPlan,
  getSupportPlanTempList,
  getSupportPlanDetail,
  getTempPlanDetail,
  removeSupportPlan,
  removeTempPlan,
  applySupportPlan,
  updateTempPlan,
  approveTempPlan,
};
