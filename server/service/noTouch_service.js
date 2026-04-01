const beneficiaryService = require("./noTouch/beneficiaryService");
const priorityService = require("./noTouch/priorityService");

// noTouch_service 도 facade 다.
// 라우터는 이 파일만 import 하고,
// 실제 업무 책임은 beneficiary / priority 하위 서비스로 분리한다.
const BeneList = beneficiaryService.listBeneficiaries;
const BeneDetail = beneficiaryService.getBeneficiaryDetail;
const getManagerList = beneficiaryService.getManagerList;
const assignManagerToBene = beneficiaryService.assignManagerToBeneficiary;
const getManagerAssignHistory = beneficiaryService.getManagerAssignHistory;
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
  getManagerAssignHistory,
  getPriority,
  requestPriority,
  cancelPriority,
  adminApprovePriority,
  adminRejectPriority,
  getAdminRejectHistory,
};
