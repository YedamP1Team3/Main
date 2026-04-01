// service/survey/applicationService.js
const surveyMapper = require("../../database/mappers/survey_mapper");
const structureService = require("./structureService");

// 💡 실무 팁: Set 자료구조는 배열(Array.includes)보다 검색 속도(O(1))가 빠르고,
// 의도 자체가 '특정 상태 모음'임을 코드로 명확히 나타냅니다.
const BLOCKED_DELETE_STATUSES = new Set(["진행중", "진행 중", "완료"]);

const submitSurveyResult = async (data) => {
  // 1. 필수값 검증
  if (!data.bene_id || !data.version_id || !data.user_id || !data.answers) {
    throw new Error("필수 데이터가 누락되었습니다.");
  }

  // 2. 비즈니스 검증: 이미 대기/진행 중인 신청서가 있는지 확인
  const activeCount = await surveyMapper.checkActiveApplication(data.bene_id);

  if (activeCount > 0) {
    // 여기서 던진 Error는 Router의 catch 블록으로 넘어가 프론트엔드에 메시지로 전달됩니다.
    throw new Error(
      "이미 진행 중인 지원신청서가 있어 중복 신청이 불가능합니다.",
    );
  }

  // 3. 검증이 끝났다면 Mapper에 데이터를 넘겨 마스터+디테일 트랜잭션 저장을 수행합니다.
  return surveyMapper.submitSurveyApplication(data);
};

// 프론트엔드가 신청서 상세 화면을 띄우기 위해 필요한 모든 데이터를 묶어줍니다.
const getApplicationDetail = async (appId) => {
  const appInfo = await surveyMapper.getApplicationById(appId);

  if (!appInfo) {
    throw new Error("해당 신청서를 찾을 수 없습니다.");
  }

  // 앞서 SQL과 Mapper를 소문자로 통일했으므로 더 이상 방어 코드가 필요 없습니다.
  const versionId = appInfo.version_id;

  // 당시 버전에 해당하는 설문 구조를 통째로 가져옵니다.
  const structure = await structureService.getSurveyStructure(versionId);

  // 당시 사용자가 선택한 답변 내역을 가져옵니다.
  const answerRows = await surveyMapper.getAnswersByAppId(appId);
  const answers = {};

  // 프론트에서 { "상세ID": true, "상세ID": false } 형태로 쉽게 쓸 수 있게 파싱해줍니다.
  answerRows.forEach((row) => {
    const detailId = row.detail_id;
    const value = row.answer_value;

    // DB에는 1 또는 0으로 들어있을 수 있으므로 boolean으로 변환합니다.
    answers[detailId] = value === 1 || value === true || value === "1";
  });

  return {
    app_info: appInfo,
    survey_data: structure,
    answers,
  };
};

const getApplicationListByBene = async (beneId) => {
  // 별도 비즈니스 로직 없이 바로 DB 데이터를 리턴합니다.
  return surveyMapper.getApplicationList(beneId);
};

// 사용자가 임의로 데이터를 지우지 못하게 막는 비즈니스 로직입니다.
const deleteSurveyApplication = async (appId) => {
  const appData = await surveyMapper.getApplicationStatus(appId);

  // 방어 코드 삭제: 단일 키로 명확하게 받습니다.
  const status = appData?.app_status;

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
