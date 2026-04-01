const surveyMapper = require("../../database/mappers/survey_mapper");

const moveBeneficiaryApplicationsToInProgress = async (beneId) => {
  if (!beneId) {
    throw new Error("MISSING_PARAM");
  }

  return surveyMapper.updateApplicationsToInProgressByBene(beneId);
};

module.exports = {
  moveBeneficiaryApplicationsToInProgress,
};
