const resultMapper = require("../database/mappers/result_mapper.js");

//지원결과 리스트
const getSupportResultList = async (beneId) => {
  let list = await resultMapper.selectSupportResultList(beneId);
  return list || [];
};

const getSupportResultTempList = async (beneId) => {
  let list = await resultMapper.selectSupportResultTempList(beneId);
  return list || [];
};

const createSupportResult = async (newResult) => {
  const {
    selected_plans,
    manager_id,
    bene_id,
    result_title,
    result_content,
    progress_state,
  } = newResult;

  // 1. 결과서 본문 데이터 준비 (첫 번째 계획서를 대표 ID로 사용)
  const mainPlanId =
    selected_plans.length > 0 ? selected_plans[0].plan_id : null;
  const insertData = [
    mainPlanId,
    manager_id,
    bene_id,
    result_title,
    result_content,
    progress_state || "대기",
  ];

  // 2. 결과서 본문 저장
  const result = await resultMapper.createSupportResult(insertData);
  const newResultId = result.insertId;

  // 3. 매핑 테이블 저장 (선택된 계획서가 있을 때만)
  if (newResultId && selected_plans.length > 0) {
    const mappingValues = selected_plans.map((plan) => [
      newResultId,
      plan.plan_id,
    ]);
    await resultMapper.insertMapping(mappingValues);
  }

  return { success: true, insertId: newResultId };
};

const createTempResult = async (newResult) => {
  const {
    selected_plans,
    manager_id,
    bene_id,
    result_title,
    result_content,
    progress_state,
  } = newResult;

  const mainPlanId = selected_plans?.[0]?.plan_id || null;
  // 1. 계획서 ID들을 문자열로 변환 (예: "71,72,85")
  const allPlanIds = selected_plans?.map((p) => p.plan_id).join(",") || null;

  const insertData = [
    mainPlanId,
    manager_id,
    bene_id,
    result_title,
    result_content,
    allPlanIds,
    progress_state || "임시",
  ];

  // 2. 결과서 본문 저장
  const result = await resultMapper.createTempResult(insertData);
  const newResultId = result.insertId;

  return { success: true, insertId: newResultId };
};

const getApprovedPlanList = async (beneId) => {
  let list = await resultMapper.selectApprovedPlanList(beneId);
  return list || [];
};

const getSupportDetail = async (resultID) => {
  let resultInfo = await resultMapper.selectSupportResultDetail(resultID);
  let planList = await resultMapper.selectLinkedPlanList(resultID);
  // 3. 결과서 정보가 있을 때만 목록을 합쳐서 반환
  if (resultInfo) {
    // resultInfo 객체 안에 'selected_plans'라는 이름으로 목록을 쏙 넣어줍니다.
    resultInfo.selected_plans = planList || [];
    return resultInfo;
  }
  return {};
};

const removeSupportResult = async (resultId) => {
  let result = await resultMapper.removeSupportResult(resultId);
  let resObj = {
    status: result.affectedRows > 0 ? "success" : "fail",
    result_no: resultId,
  };
  return resObj;
};

const applySupportResult = async (resultId, resultData, planIds) => {
  try {
    await resultMapper.applySupportResult(resultId, resultData);
    await resultMapper.removeMapping(resultId);

    if (planIds && planIds.length > 0) {
      const mappingValues = planIds.map((planId) => [resultId, planId]);
      await resultMapper.insertMapping(mappingValues);
    }
    return { status: "success", message: "승인요청이 완료되었습니다" };
  } catch (err) {
    console.error("승인처리중 서비스 에러", err);
    return { status: "fail", message: "승인 처리 중 오류가 발생했습니다." };
  }
};

const updateTempSupportResult = async (resultId, resultData, planIds) => {
  try {
    await resultMapper.updateTempSupportResult(resultId, resultData);
    await resultMapper.removeMapping(resultId);

    if (planIds && planIds.length > 0) {
      const mappingValues = planIds.map((planId) => [resultId, planId]);
      await resultMapper.insertMapping(mappingValues);
    }
    return { status: "success", message: "승인요청이 완료되었습니다" };
  } catch (err) {
    console.error("승인처리중 서비스 에러", err);
    return { status: "fail", message: "승인 처리 중 오류가 발생했습니다." };
  }
};

module.exports = {
  getSupportResultList,
  getSupportResultTempList,
  createSupportResult,
  createTempResult,
  getApprovedPlanList,
  getSupportDetail,
  removeSupportResult,
  applySupportResult,
  updateTempSupportResult,
};
