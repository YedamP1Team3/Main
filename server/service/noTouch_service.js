const beneficiaryService = require("./noTouch/beneficiaryService");
const priorityService = require("./noTouch/priorityService");

const BeneList = beneficiaryService.listBeneficiaries;
const BeneDetail = beneficiaryService.getBeneficiaryDetail;
const getManagerList = beneficiaryService.getManagerList;
const assignManagerToBene = beneficiaryService.assignManagerToBeneficiary;
const getPriority = priorityService.getPriority;
const requestPriority = priorityService.requestPriority;
const cancelPriority = priorityService.cancelPriority;
const adminApprovePriority = priorityService.adminApprovePriority;
const adminRejectPriority = priorityService.adminRejectPriority;
const getAdminRejectHistory = priorityService.getAdminRejectHistory;

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
