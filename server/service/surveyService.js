const structureService = require("./survey/structureService");
const applicationService = require("./survey/applicationService");

// surveyService 는 facade 역할만 담당한다.
// 라우터는 이 파일만 바라보고,
// 실제 책임은 structure/application 하위 서비스로 나눈다.
const getSurveyStructure = structureService.getSurveyStructure;
const itemAdd = structureService.itemAdd;
const subItemAdd = structureService.subItemAdd;
const registerDetail = structureService.registerDetail;
const deleteSelected = structureService.deleteSelected;
const getSurveyVersions = structureService.getSurveyVersions;
const makeNewSurveyVersion = structureService.makeNewSurveyVersion;
const getActiveSurvey = structureService.getActiveSurvey;
const submitSurveyResult = applicationService.submitSurveyResult;
const getApplicationDetail = applicationService.getApplicationDetail;
const getApplicationListByBene = applicationService.getApplicationListByBene;
const deleteSurveyApplication = applicationService.deleteSurveyApplication;

module.exports = {
  getSurveyStructure,
  itemAdd,
  subItemAdd,
  registerDetail,
  deleteSelected,
  getSurveyVersions,
  makeNewSurveyVersion,
  getActiveSurvey,
  submitSurveyResult,
  getApplicationDetail,
  getApplicationListByBene,
  deleteSurveyApplication,
};
