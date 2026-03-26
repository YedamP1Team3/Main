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
// 1. 대기단계 조회
const getPriority = async (bene_id) => {
  if (!bene_id) throw new Error("MISSING_PARAM");

  const list = await noTouchMapper.prioList(bene_id);
  // MariaDB의 query 결과는 배열이므로, 데이터가 있으면 첫 번째 객체를, 없으면 null을 반환합니다.
  return list.length > 0 ? list[0] : null;
};

// 2. 대기단계 승인/재승인 요청 (UPSERT)
const requestPriority = async (bene_id, priority_status) => {
  if (!bene_id || !priority_status) {
    throw new Error("MISSING_PARAM");
  }

  const result = await noTouchMapper.prioPending(bene_id, priority_status);
  return true;
};

// 3. 대기단계 취소 (DELETE)
const cancelPriority = async (bene_id) => {
  if (!bene_id) {
    throw new Error("MISSING_PARAM");
  }

  const result = await noTouchMapper.prioCancel(bene_id);
  return true;
};
module.exports = {
  BeneList,
  BeneDetail,
  getManagerList,
  assignManagerToBene,
  getPriority,
  requestPriority,
  cancelPriority,
};
