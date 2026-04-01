const surveyMapper = require("../../database/mappers/survey_mapper");
const structureService = require("./structureService");

const BLOCKED_DELETE_STATUSES = new Set(["진행중", "진행 중", "완료"]);

// 지원신청서 제출은 "신청서 1건 + 답변 여러 건"을 함께 저장하는 흐름이다.
// 그래서 실제 insert 는 mapper transaction 쪽에서 처리하고,
// service 는 제출 가능 여부만 먼저 검증한다.
const submitSurveyResult = async (data) => {
  if (!data.bene_id || !data.version_id || !data.user_id || !data.answers) {
    throw new Error("필수 데이터가 누락되었습니다.");
  }

  const activeCount = await surveyMapper.checkActiveApplication(data.bene_id);

  if (activeCount > 0) {
    throw new Error("이미 진행 중인 지원신청서가 있어 중복 신청이 불가능합니다.");
  }

  return surveyMapper.submitSurveyApplication(data);
};

// 신청서 상세 조회는 "신청서 메타데이터 + 당시 설문 구조 + 답변값"을 합쳐서
// 프론트가 바로 그릴 수 있는 형태로 반환한다.
const getApplicationDetail = async (appId) => {
  const appInfo = await surveyMapper.getApplicationById(appId);

  if (!appInfo) {
    throw new Error("해당 신청서를 찾을 수 없습니다.");
  }

  const versionId = appInfo.VERSION_ID || appInfo.version_id;
  const structure = await structureService.getSurveyStructure(versionId);
  const answerRows = await surveyMapper.getAnswersByAppId(appId);
  const answers = {};

  answerRows.forEach((row) => {
    const detailId = row.DETAIL_ID || row.detail_id;
    const value = row.ANSWER_VALUE || row.answer_value;
    answers[detailId] = value === 1 || value === true;
  });

  return {
    app_info: appInfo,
    survey_data: structure,
    answers,
  };
};

const getApplicationListByBene = async (beneId) => {
  return surveyMapper.getApplicationList(beneId);
};

// 이미 검토가 시작된 신청서는 사용자가 임의로 삭제하지 못하게 막는다.
const deleteSurveyApplication = async (appId) => {
  const appData = await surveyMapper.getApplicationStatus(appId);
  const status = appData?.app_status || appData?.status;

  if (BLOCKED_DELETE_STATUSES.has(status)) {
    throw new Error("해당 건은 검토가 시작되어 삭제가 불가능합니다.");
  }

  return surveyMapper.deleteApplicationTransaction(appId);
};

module.exports = {
  submitSurveyResult,
  getApplicationDetail,
  getApplicationListByBene,
  deleteSurveyApplication,
};
