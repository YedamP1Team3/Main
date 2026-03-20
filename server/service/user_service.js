const userMapper = require("../database/mappers/user_mapper.js");

//전체 회원조회
const findAll = async () => {
  let list = await userMapper.selectAllUser();
  return list;
};

//지원자 조회
const BeneficiaryList = async () => {
  const list = await userMapper.selectBeneficiaryList();
  return list || [];
};
//지원제 상세조회
const BeneficiaryDetail = async (id) => {
  const detail = await userMapper.selectBeneficiaryById(id);
  return detail || null;
};

const SupportPlan = async (beneId) => {
  let list = await userMapper.selectSupportPlan(beneId);
  return list || [];
};

module.exports = { findAll, BeneficiaryList, BeneficiaryDetail, SupportPlan };
