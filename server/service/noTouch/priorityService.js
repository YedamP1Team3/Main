const noTouchMapper = require("../../database/mappers/noTouch_mapper");
const applicationLifecycleService = require("../shared/applicationLifecycleService");

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const getPriority = async (beneId) => {
  if (!beneId) {
    throw createError(400, "bene_id가 필요합니다.");
  }

  return noTouchMapper.getLatestPriority(beneId);
};

const requestPriority = async (beneId, priorityStatus) => {
  if (!beneId || !priorityStatus) {
    throw createError(400, "bene_id와 priority_status는 필수입니다.");
  }

  // priority 테이블은 "현재 상태 update"보다 "상태 이력 append" 구조다.
  // 그래서 요청이 들어오면 pending 한 줄을 새로 추가해
  // 나중에 승인/반려가 어떤 요청에 대해 일어난 것인지 시간순으로 복구할 수 있게 만든다.
  await noTouchMapper.insertPriorityHistory(
    beneId,
    priorityStatus,
    "pending",
  );

  // 현재 프로젝트 기준으로는 매니저가 대기단계를 신청하는 순간부터
  // 실질적인 검토가 시작된다고 보고 신청서를 바로 "진행중"으로 올린다.
  // 승인 시점까지 기다리면 member 화면과 관리자 화면의 체감 흐름이 어긋날 수 있다.
  await applicationLifecycleService.moveBeneficiaryApplicationsToInProgress(
    beneId,
  );

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
  if (!beneId) {
    throw createError(400, "bene_id가 필요합니다.");
  }

  const latest = await noTouchMapper.getLatestPriority(beneId);

  if (!latest || latest.progress_status !== "pending") {
    throw createError(404, "승인 가능한 대기단계 요청이 없습니다.");
  }

  // 신청서 상태는 request 시점에 이미 진행중으로 바뀌었기 때문에
  // approve 단계에서는 "관리자가 승인했다"는 이력만 남기면 된다.
  await noTouchMapper.insertPriorityHistory(
    beneId,
    latest.priority_status,
    "approved",
  );

  return true;
};

const adminRejectPriority = async (beneId, reason) => {
  if (!beneId || !reason) {
    throw createError(400, "bene_id와 reason은 필수입니다.");
  }

  const latest = await noTouchMapper.getLatestPriority(beneId);

  if (!latest || latest.progress_status !== "pending") {
    throw createError(404, "반려 가능한 대기단계 요청이 없습니다.");
  }

  // 반려 시에도 기존 요청 row를 수정하지 않고 새 rejected row를 추가한다.
  // 이렇게 해야 여러 번 신청/반려된 이력을 나중에 화면에서 시간순으로 보여줄 수 있다.
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
    throw createError(400, "bene_id가 필요합니다.");
  }

  return noTouchMapper.getRejectHistory(beneId);
};

module.exports = {
  getPriority,
  requestPriority,
  cancelPriority,
  adminApprovePriority,
  adminRejectPriority,
  getAdminRejectHistory,
};
