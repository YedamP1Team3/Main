const noTouchMapper = require("../../database/mappers/noTouch_mapper");
const applicationLifecycleService = require("../shared/applicationLifecycleService");

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

// 💡 유틸 함수: 현재 상태 기준 사이클의 Root ID를 찾습니다.
const getRootPriorityId = (latest) => {
  if (!latest) return null;
  // 이미 승인되었거나 취소되어 사이클이 끝난 상태라면 Root ID는 없습니다 (새로운 사이클 시작)
  if (latest.progress_status === "approved" || latest.progress_status === "none") return null;
  
  // priority_id2가 있으면 그것이 Root ID이고, 없으면 자기 자신이 Root ID입니다.
  return latest.priority_id2 || latest.priority_id;
};

const getPriority = async (beneId) => {
  if (!beneId) {
    throw createError(400, "bene_id가 필요합니다.");
  }

  return noTouchMapper.getLatestPriority(beneId);
};

const requestPriority = async (beneId, priorityStatus) => {
  if (!beneId || !priorityStatus) throw createError(400, "bene_id와 priority_status는 필수입니다.");

  const latest = await noTouchMapper.getLatestPriority(beneId);
  const rootId = getRootPriorityId(latest); // 현재 진행중인 사이클이 있다면 Root ID 유지, 아니면 null

  await noTouchMapper.insertPriorityHistory(
    beneId,
    priorityStatus,
    "pending",
    null,
    rootId 
  );

  await applicationLifecycleService.moveBeneficiaryApplicationsToInProgress(beneId);
  return true;
};

const cancelPriority = async (beneId) => {
  if (!beneId) {
    throw createError(400, "bene_id가 필요합니다.");
  }

  await noTouchMapper.cancelPriorityHistory(beneId);
  return true;
};

const adminApprovePriority = async (beneId) => {
  if (!beneId) throw createError(400, "bene_id가 필요합니다.");

  const latest = await noTouchMapper.getLatestPriority(beneId);
  if (!latest || latest.progress_status !== "pending") {
    throw createError(404, "승인 가능한 대기단계 요청이 없습니다.");
  }

  const rootId = getRootPriorityId(latest);

  await noTouchMapper.insertPriorityHistory(
    beneId,
    latest.priority_status,
    "approved",
    null,
    rootId
  );

  return true;
};
const adminRejectPriority = async (beneId, reason) => {
  if (!beneId || !reason) throw createError(400, "bene_id와 reason은 필수입니다.");

  const latest = await noTouchMapper.getLatestPriority(beneId);
  if (!latest || latest.progress_status !== "pending") {
    throw createError(404, "반려 가능한 대기단계 요청이 없습니다.");
  }

  // 직전 PK가 아닌, 최초 신청 PK(Root ID)를 찾아 물려줍니다.
  const rootId = getRootPriorityId(latest);

  await noTouchMapper.insertPriorityHistory(
    beneId,
    latest.priority_status,
    "rejected",
    reason,
    rootId
  );

  return true;
};
const getAdminRejectHistory = async (beneId) => {
  if (!beneId) throw createError(400, "bene_id가 필요합니다.");

  const latest = await noTouchMapper.getLatestPriority(beneId);
  if (!latest) return [];

  // 조회 시점에도 현재 사이클의 Root ID를 기준으로 조회합니다.
  const rootId = getRootPriorityId(latest);
  
  if (!rootId) return []; // 진행중인 사이클이 없으면 반려 이력도 빈 배열 반환

  return noTouchMapper.getRejectHistory(beneId, rootId);
};

module.exports = {
  getPriority,
  requestPriority,
  cancelPriority,
  adminApprovePriority,
  adminRejectPriority,
  getAdminRejectHistory,
};
