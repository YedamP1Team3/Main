const resultMapper = require("../database/mappers/result_mapper.js");

//지원결과 리스트
const resultListService = async (beneId) => {
  let list = await resultMapper.resultListMapper(beneId);
  return list || [];
};

const saveResultListService = async (beneId) => {
  let list = await resultMapper.saveResultListMapper(beneId);
  return list || [];
};

const newResultService = async (newResult) => {
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
  const result = await resultMapper.newResultMapper(insertData);
  const newResultId = result.insertId;

  // 3. 매핑 테이블 저장 (선택된 계획서가 있을 때만)
  if (newResultId && selected_plans.length > 0) {
    const mappingValues = selected_plans.map((plan) => [
      newResultId,
      plan.plan_id,
    ]);
    await resultMapper.listMappingMapper(mappingValues);
  }

  return { success: true, insertId: newResultId };
};

const supportListService = async (beneId) => {
  let list = await resultMapper.supportListMapper(beneId);
  return list || [];
};

const detailSupportResultService = async (resultID) => {
  let resultInfo = await resultMapper.detailResultPlanMapper(resultID);
  let planList = await resultMapper.plusPlanListMapper(resultID);
  // 3. 결과서 정보가 있을 때만 목록을 합쳐서 반환
  if (resultInfo) {
    // resultInfo 객체 안에 'selected_plans'라는 이름으로 목록을 쏙 넣어줍니다.
    resultInfo.selected_plans = planList || [];
    return resultInfo;
  }
  return {};
};

const supportResultService = async (resultId) => {
  let result = await resultMapper.supportResultMapper(resultId);
  let resObj = {
    status: result.affectedRows > 0 ? "success" : "fail",
    result_no: resultId,
  };
  return resObj;
};

const updateSupportResultService = async (resultId, resultDate, planIds) => {
  try {
    await resultMapper.updateResultPlanMapper(resultId, resultDate);
    await resultMapper.deleteMappingMapper(resultId);

    if (planIds && planIds.length > 0) {
      const mappingValues = planIds.map((planId) => [resultId, planId]);
      await resultMapper.listMappingMapper(mappingValues);
    }
    return { status: "success", message: "승인요청이 완료되었습니다" };
  } catch (err) {
    console.error("승인처리중 서비스 에러", err);
    return { status: "fail", message: "승인 처리 중 오류가 발생했습니다." };
  }
};

const updateSaveSaveService = async (resultId, resultDate, planIds) => {
  try {
    await resultMapper.updateSavePlanMapper(resultId, resultDate);
    await resultMapper.deleteMappingMapper(resultId);

    if (planIds && planIds.length > 0) {
      const mappingValues = planIds.map((planId) => [resultId, planId]);
      await resultMapper.listMappingMapper(mappingValues);
    }
    return { status: "success", message: "승인요청이 완료되었습니다" };
  } catch (err) {
    console.error("승인처리중 서비스 에러", err);
    return { status: "fail", message: "승인 처리 중 오류가 발생했습니다." };
  }
};

module.exports = {
  resultListService,
  saveResultListService,
  newResultService,
  supportListService,
  detailSupportResultService,
  supportResultService,
  updateSupportResultService,
  updateSaveSaveService,
};
