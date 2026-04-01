// service/surveyService.js

// 💡 실무 원칙: 구조 관리(Structure)와 신청서 관리(Application)로 쪼개진 비즈니스 로직을
// Router가 신경 쓰지 않도록 한 곳으로 모아주는 'Facade(파사드)' 역할을 합니다.
// 이렇게 하면 나중에 Service 파일이 더 잘게 쪼개져도 Router 코드는 수정할 필요가 없습니다.

const structureService = require("./survey/structureService");
const applicationService = require("./survey/applicationService");

module.exports = {
  // --- [설문 구조 관리 (Structure)] ---
  getSurveyStructure: structureService.getSurveyStructure,
  itemAdd: structureService.itemAdd,
  subItemAdd: structureService.subItemAdd,
  registerDetail: structureService.registerDetail,
  deleteSelected: structureService.deleteSelected,
  getSurveyVersions: structureService.getSurveyVersions,
  makeNewSurveyVersion: structureService.makeNewSurveyVersion,
  getActiveSurvey: structureService.getActiveSurvey,

  // --- [지원 신청서 관리 (Application)] ---
  submitSurveyResult: applicationService.submitSurveyResult,
  getApplicationDetail: applicationService.getApplicationDetail,
  getApplicationListByBene: applicationService.getApplicationListByBene,
  deleteSurveyApplication: applicationService.deleteSurveyApplication,
};
