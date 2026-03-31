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
  const { selected_plans, manager_id, bene_id, result_title, result_content } =
    newResult;

  // 1. 본문 데이터 준비
  const mainPlanId = selected_plans?.[0]?.plan_id || null;
  const insertData = [
    mainPlanId,
    manager_id,
    bene_id,
    result_title,
    result_content,
    "임시",
  ];

  try {
    // 2. 본문 저장
    const result = await resultMapper.createTempResult(insertData);
    const newResultId = result.insertId;

    // 3. 매핑 저장 (plan_id들만 추출해서 전달)
    if (newResultId && selected_plans?.length > 0) {
      const planIds = selected_plans.map((p) => p.plan_id); // [71, 72...] 형태
      await resultMapper.insertTempMapping(newResultId, planIds);
    }

    return { success: true, insertId: newResultId };
  } catch (err) {
    console.error("임시저장 서비스 에러:", err);
    throw err;
  }
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

const getSupportTempDetail = async (resultId) => {
  try {
    // 1. 임시 테이블에서 데이터 가져오기
    let resultInfo = await resultMapper.selectSupportResultTempDetail(resultId);

    if (resultInfo) {
      // 2. 매핑 데이터 처리: "71,72" -> [71, 72]
      if (resultInfo.selected_plan_ids) {
        // 쉼표로 분리 후 숫자로 변환
        const planIds = resultInfo.selected_plan_ids.split(",").map(Number);
        resultInfo.selected_plans = planIds;
      } else {
        resultInfo.selected_plans = [];
      }
      return resultInfo;
    }
    return {};
  } catch (err) {
    console.error("임시저장 상세조회 서비스 에러:", err);
    throw err;
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
  getSupportTempDetail,
};
