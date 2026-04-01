const noTouchMapper = require("../../database/mappers/noTouch_mapper");

const listBeneficiaries = async (managerId) => {
  const list = await noTouchMapper.selectBeneList(managerId);
  return list || [];
};

const getBeneficiaryDetail = async (beneId) => {
  const detail = await noTouchMapper.BeneById(beneId);
  return detail || null;
};

const getManagerList = async () => {
  const managers = await noTouchMapper.selectManagers();
  return managers || [];
};

const assignManagerToBeneficiary = async (beneId, managerId) => {
  if (!beneId || !managerId) {
    throw new Error("MISSING_PARAM");
  }

  const result = await noTouchMapper.updateManager(beneId, managerId);

  if (result.affectedRows === 0) {
    throw new Error("NOT_FOUND");
  }

  return true;
};

module.exports = {
  listBeneficiaries,
  getBeneficiaryDetail,
  getManagerList,
  assignManagerToBeneficiary,
};
