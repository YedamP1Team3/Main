const surveyMapper = require("../../database/mappers/survey_mapper");

const moveBeneficiaryApplicationsToInProgress = async (beneId) => {
  if (!beneId) {
    const error = new Error("bene_id가 필요합니다.");
    error.status = 400;
    throw error;
  }

  // 대기단계 승인 후에는 연결된 신청서를 진행중으로 바꿔야
  // 관리자 화면과 신청서 상태가 같은 흐름을 보게 된다.
  return surveyMapper.updateApplicationsToInProgressByBene(beneId);
};

module.exports = {
  moveBeneficiaryApplicationsToInProgress,
};
