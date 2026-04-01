const surveyMapper = require("../../database/mappers/survey_mapper");
const structureService = require("./structureService");

// 신청이 이미 검토 단계로 넘어간 뒤에는 작성자가 임의로 삭제하면 안 된다.
// member 화면에서는 "대기" 상태까지만 삭제를 허용하고,
// 실제 검토가 시작된 "진행중", 최종 종료된 "완료"는 삭제를 막는다.
const BLOCKED_DELETE_STATUSES = new Set(["진행중", "진행 중", "완료"]);

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const submitSurveyResult = async (data) => {
  if (!data.bene_id || !data.version_id || !data.user_id) {
    throw createError(400, "bene_id, version_id, user_id는 필수입니다.");
  }

  if (!data.answers || Object.keys(data.answers).length === 0) {
    throw createError(400, "answers는 최소 1개 이상 필요합니다.");
  }

  // 같은 지원대상자에게 아직 끝나지 않은 신청서가 이미 있으면
  // 신청 단계, 대기단계, 결과 승인 흐름이 두 줄로 갈라져 정합성이 깨진다.
  // 그래서 저장 전에 "진행 중인 신청서가 있는가"를 먼저 확인한다.
  const activeCount = await surveyMapper.checkActiveApplication(data.bene_id);

  if (activeCount > 0) {
    throw createError(
      400,
      "이미 진행 중인 지원신청서가 있어 중복 신청은 할 수 없습니다.",
    );
  }

  return surveyMapper.submitSurveyApplication(data);
};

const getApplicationDetail = async (appId) => {
  if (!appId) {
    throw createError(400, "app_id가 필요합니다.");
  }

  // 상세 조회 화면은 application 한 줄만으로는 완성되지 않는다.
  // "신청 당시 사용한 설문 버전 구조"와 "실제 체크한 답변"을 다시 합쳐야
  // 프론트가 질문/답변을 같은 화면에서 자연스럽게 렌더링할 수 있다.
  const appInfo = await surveyMapper.getApplicationById(appId);

  if (!appInfo) {
    throw createError(404, "해당 신청서를 찾을 수 없습니다.");
  }

  const structure = await structureService.getSurveyStructure(appInfo.version_id);
  const answerRows = await surveyMapper.getAnswersByAppId(appId);
  const answers = {};

  // DB에는 0/1로 저장하지만, 프론트의 체크 UI는 true/false를 다루기 쉽다.
  // service에서 한 번 변환해 두면 화면 컴포넌트는 표시 역할에만 집중할 수 있다.
  answerRows.forEach((row) => {
    answers[row.detail_id] = row.answer_value === 1 || row.answer_value === true;
  });

  return {
    app_info: appInfo,
    survey_data: structure,
    answers,
  };
};

const getApplicationListByBene = async (beneId) => {
  if (!beneId) {
    throw createError(400, "bene_id가 필요합니다.");
  }

  return surveyMapper.getApplicationList(beneId);
};

const deleteSurveyApplication = async (appId) => {
  if (!appId) {
    throw createError(400, "app_id가 필요합니다.");
  }

  const appData = await surveyMapper.getApplicationStatus(appId);

  if (!appData) {
    throw createError(404, "해당 신청서를 찾을 수 없습니다.");
  }

  // 신청이 이미 검토 흐름에 들어간 뒤 삭제를 허용하면
  // 관리자 화면에서는 존재하던 신청이 사라지고,
  // 대기단계/결과서 같은 후속 이력과 실제 신청 데이터가 어긋날 수 있다.
  if (BLOCKED_DELETE_STATUSES.has(appData.app_status)) {
    throw createError(
      400,
      "해당 신청서는 이미 검토가 시작되어 삭제할 수 없습니다.",
    );
  }

  return surveyMapper.deleteApplicationTransaction(appId);
};

module.exports = {
  submitSurveyResult,
  getApplicationDetail,
  getApplicationListByBene,
  deleteSurveyApplication,
};
