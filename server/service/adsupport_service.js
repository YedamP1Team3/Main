const adminMapper = require("../database/mappers/adsupport_mapper.js");
const MappingMapper = require("../database/mappers/result_mapper.js");

const getSupportPlanList = async (beneId) => {
  let list = await adminMapper.selectSupportPlanList(beneId);
  return list || [];
};

const getSupportPlanDetail = async (planID) => {
  let planResult = await adminMapper.selectSupportPlanDetail(planID);
  let fileList = await adminMapper.selectAttachments(planID);
  return {
    plan: planResult || {},
    files: fileList || [],
  };
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
//지원계획서히스토리
const addRejectionHistory = async (data) => {
  const {
    plan_id,
    plan_objective,
    plan_content,
    rejection_reason,
    manager_id,
  } = data;
  let insertDate = [
    plan_id,
    plan_objective,
    plan_content,
    rejection_reason,
    manager_id,
  ];

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
  const {
    result_id,
    result_title,
    result_content,
    rejection_reason,
    manager_id,
    plan_ids, // 프론트에서 넘어온 배열
  } = data;

  const insertData = [
    result_id,
    result_title,
    result_content,
    rejection_reason,
    manager_id,
  ];

  try {
    // 1. 반려 히스토리 메인 정보 저장 (resultrejection_history 테이블)
    const result = await adminMapper.addResultRejectionHistory(insertData);
    const newHistoryId = result.insertId;

    // 2. 매핑 데이터 저장 (result_plan_mapping_history 테이블)
    if (newHistoryId > 0 && plan_ids && plan_ids.length > 0) {
      for (let planId of plan_ids) {
        // 매퍼의 resultMappingHistory를 호출하여 하나씩 저장
        await adminMapper.resultMappingHistory(newHistoryId, planId);
      }
    }

    return {
      status: newHistoryId > 0 ? "success" : "fail",
      history_id: newHistoryId,
    };
  } catch (err) {
    console.error("반려 히스토리 저장 서비스 에러:", err);
    throw err;
  }
};

// 1. 리스트만 가져오는 서비스 (기존 유지)
const getResultRejectionHistory = async (resultId) => {
  let list = await adminMapper.selectResultRejectionHistory(resultId);
  return list || [];
};

// 2. 특정 이력의 상세(계획서 포함)를 가져오는 서비스 추가
const getRejectionHistoryDetail = async (historyId) => {
  // 매핑된 계획서 목록 조회
  const rows = await adminMapper.selectResultMappingHistory(historyId);

  // ⭐️ 반드시 객체 안에 plans 배열을 담아서 리턴하세요.
  return {
    plans: rows || [],
  };
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
  getRejectionHistoryDetail,
};
