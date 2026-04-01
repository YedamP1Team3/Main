const noTouchMapper = require("../../database/mappers/noTouch_mapper");
const applicationLifecycleService = require("../shared/applicationLifecycleService");

const getPriority = async (beneId) => {
  if (!beneId) {
    throw new Error("MISSING_PARAM");
  }

  const latest = await noTouchMapper.getLatestPriority(beneId);
  return latest || null;
};

// 매니저가 우선순위 변경을 요청하면 priority 테이블에 pending 이력 1건이 쌓인다.
const requestPriority = async (beneId, priorityStatus) => {
  if (!beneId || !priorityStatus) {
    throw new Error("MISSING_PARAM");
  }

  await noTouchMapper.insertPriorityHistory(beneId, priorityStatus, "pending");

  return true;
};

const cancelPriority = async (beneId) => {
  if (!beneId) {
    throw new Error("MISSING_PARAM");
  }

  await noTouchMapper.cancelPriorityHistory(beneId);
  return true;
};

// 관리자가 승인하면:
// 1) priority 이력에 approved 를 남기고
// 2) 연결된 신청서를 진행중 상태로 바꾼다.
const adminApprovePriority = async (beneId) => {
  if (!beneId) {
    throw new Error("MISSING_PARAM");
  }

  const latest = await noTouchMapper.getLatestPriority(beneId);

  if (!latest || latest.progress_status !== "pending") {
    throw new Error("NOT_FOUND");
  }

  await noTouchMapper.insertPriorityHistory(
    beneId,
    latest.priority_status,
    "approved",
  );

  await applicationLifecycleService.moveBeneficiaryApplicationsToInProgress(
    beneId,
  );

  return true;
};

// 반려는 요청 이력을 지우지 않고 rejected 행을 추가해서 히스토리를 남긴다.
const adminRejectPriority = async (beneId, reason) => {
  if (!beneId || !reason) {
    throw new Error("MISSING_PARAM");
  }

  const latest = await noTouchMapper.getLatestPriority(beneId);

  if (!latest || latest.progress_status !== "pending") {
    throw new Error("NOT_FOUND");
  }

  await noTouchMapper.insertPriorityHistory(
    beneId,
    latest.priority_status,
    "rejected",
    reason,
    latest.priority_id,
  );

  return true;
};

const getAdminRejectHistory = async (beneId) => {
  if (!beneId) {
    throw new Error("MISSING_PARAM");
  }

  const history = await noTouchMapper.getRejectHistory(beneId);
  return history || [];
};

module.exports = {
  getPriority,
  requestPriority,
  cancelPriority,
  adminApprovePriority,
  adminRejectPriority,
  getAdminRejectHistory,
};
