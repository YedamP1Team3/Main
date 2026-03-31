const structureService = require("./survey/structureService");
const applicationService = require("./survey/applicationService");

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
