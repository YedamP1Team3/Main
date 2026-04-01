const noTouchMapper = require("../../database/mappers/noTouch_mapper");

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const listBeneficiaries = async () => {
  return noTouchMapper.selectBeneList();
};

const getBeneficiaryDetail = async (beneId) => {
  if (!beneId) {
    throw createError(400, "bene_id가 필요합니다.");
  }

  const detail = await noTouchMapper.BeneById(beneId);
  return detail || {};
};

const getManagerList = async () => {
  return noTouchMapper.selectManagers();
};

const assignManagerToBeneficiary = async (beneId, managerId, adminId = null) => {
  if (!beneId || !managerId) {
    throw createError(400, "bene_id와 manager_id는 필수입니다.");
  }

  // "현재 담당자 변경"과 "배정 이력 기록"은 항상 같이 성공해야 한다.
  // 둘 중 하나만 반영되면 화면의 현재 상태와 로그 화면이 서로 다른 사실을 보여주게 된다.
  const result = await noTouchMapper.updateManagerWithLog(
    beneId,
    managerId,
    adminId,
  );

  if (result.affectedRows === 0) {
    throw createError(404, "담당자를 배정할 지원대상자를 찾을 수 없습니다.");
  }

  return true;
};

const getManagerAssignHistory = async (beneId) => {
  if (!beneId) {
    throw createError(400, "bene_id가 필요합니다.");
  }

  return noTouchMapper.getManagerAssignHistory(beneId);
};

module.exports = {
  listBeneficiaries,
  getBeneficiaryDetail,
  getManagerList,
  assignManagerToBeneficiary,
  getManagerAssignHistory,
};
