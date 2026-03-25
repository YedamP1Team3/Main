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
module.exports = {
  BeneList,
  BeneDetail,
  getManagerList,
  assignManagerToBene,
};
