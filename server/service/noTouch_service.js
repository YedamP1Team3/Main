const noTouchMapper = require("../database/mappers/noTouch_mapper");

//지원자 조회
const BeneList = async (Id) => {
  const list = await noTouchMapper.selectBeneList(Id);
  return list || [];
};
//지원제 상세조회
const BeneDetail = async (id) => {
  const detail = await noTouchMapper.BeneById(id);
  return detail || null;
};

// 1. 담당자 목록 조회 서비스
const getManagerList = async () => {
  const managers = await noTouchMapper.selectManagers();
  return managers;
};

// 2. 담당자 배정 서비스
const assignManagerToBene = async (bene_id, manager_id) => {
  // 파라미터 누락 검사
  if (!bene_id || !manager_id) {
    throw new Error("MISSING_PARAM");
  }

  const result = await noTouchMapper.updateManager(bene_id, manager_id);

  // 업데이트된 행이 없다면 대상자를 찾지 못한 것
  if (result.affectedRows === 0) {
    throw new Error("NOT_FOUND");
  }

  return true; // 성공 시 true 반환
};
// 대기단계 페이지
// 1. 대기단계 최신 조회 (매니저/관리자 공통)
const getPriority = async (bene_id) => {
  if (!bene_id) throw new Error("MISSING_PARAM");
  const latest = await noTouchMapper.getLatestPriority(bene_id);
  // 배열이 아니라 단건 객체로 넘오오도록 DAO를 짰으므로 그냥 latest 반환
  return latest || null;
};

// 2. 대기단계 승인 요청 (매니저가 신청할 때)
const requestPriority = async (bene_id, priority_status) => {
  if (!bene_id || !priority_status) throw new Error("MISSING_PARAM");
  // progress_status를 'pending'으로 고정해서 INSERT
  await noTouchMapper.insertPriorityHistory(
    bene_id,
    priority_status,
    "pending",
  );
  return true;
};

// 3. 대기단계 취소 (매니저가 실수로 눌렀을 때 최근 pending만 삭제)
const cancelPriority = async (bene_id) => {
  if (!bene_id) throw new Error("MISSING_PARAM");
  await noTouchMapper.cancelPriorityHistory(bene_id);
  return true;
};

// 4. 관리자 승인 (⭐️ 중요: 이전 상태를 알아야 함)
const adminApprovePriority = async (bene_id) => {
  if (!bene_id) throw new Error("MISSING_PARAM");

  // 현재 대상자가 무슨 단계(긴급/중점/계획)로 신청했는지 알아오기 위해 최신 상태 조회
  const latest = await noTouchMapper.getLatestPriority(bene_id);
  if (!latest || latest.progress_status !== "pending")
    throw new Error("NOT_FOUND");

  // 신청했던 단계 그대로 progress_status만 'approved'로 바꿔서 이력 추가 (INSERT)
  await noTouchMapper.insertPriorityHistory(
    bene_id,
    latest.priority_status,
    "approved",
  );
  return true;
};

// 5. 관리자 반려 (⭐️ 핵심: 자기참조 꼬리표 달기)
const adminRejectPriority = async (bene_id, reason) => {
  if (!bene_id || !reason) throw new Error("MISSING_PARAM");

  // 최신 대기(pending) 상태를 가져옴
  const latest = await noTouchMapper.getLatestPriority(bene_id);
  if (!latest || latest.progress_status !== "pending")
    throw new Error("NOT_FOUND");

  // 방금 신청 올라왔던 그 데이터의 PK가 부모 ID(priority_id2)가 됨!
  const parent_prio_id = latest.priority_id;

  // 반려 사유와 부모 ID를 함께 묶어서 INSERT
  await noTouchMapper.insertPriorityHistory(
    bene_id,
    latest.priority_status,
    "rejected",
    reason,
    parent_prio_id,
  );
  return true;
};

// 6. [신규] 관리자용 전체 반려 히스토리 조회
const getAdminRejectHistory = async (bene_id) => {
  if (!bene_id) throw new Error("MISSING_PARAM");
  const history = await noTouchMapper.getRejectHistory(bene_id);
  return history || [];
};
module.exports = {
  BeneList,
  BeneDetail,
  getManagerList,
  assignManagerToBene,
  getPriority,
  requestPriority,
  cancelPriority,
  adminApprovePriority,
  adminRejectPriority,
  getAdminRejectHistory,
};
