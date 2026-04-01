// service/survey/structureService.js
const surveyMapper = require("../../database/mappers/survey_mapper");

// DB 결과값이 없을 때 빈 배열을 보장하기 위한 유틸 함수
const toArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

// [조회] 설문 구조 전체 조립 (대분류 > 중분류 > 상세질문)
const getSurveyStructure = async (versionId) => {
  // Mapper에서 에러가 나면 여기서 잡지 않고 위로 던집니다.
  // Router가 catch 블록에서 받아 프론트엔드에 통일된 형태({ success: false, ... })로 에러를 내려줍니다.
  const rows = toArray(await surveyMapper.selectSurvey(versionId));

  if (rows.length === 0) {
    return { items: [], version_id: versionId };
  }

  // 💡 실무 원칙: 앞선 SQL 단계에서 모든 컬럼을 소문자로 매핑했으므로
  // 기존의 rows[0].VERSION_ID || rows[0].version_id 같은 멍청한 방어 코드를 전면 삭제했습니다.
  const currentVid = rows[0].version_id;
  const itemMap = new Map();

  // DB에서 가져온 평면적(Flat)인 조인 결과를 트리(Tree) 구조로 재조립합니다.
  rows.forEach((row) => {
    // 오직 소문자 키값만 깔끔하게 사용합니다.
    const itemId = row.item_id;
    const itemName = row.item_name;
    const subItemId = row.sub_item_id;
    const subItemName = row.sub_item_name;
    const detailId = row.detail_id;
    const questionText = row.question_text;

    if (!itemId) return;

    if (!itemMap.has(itemId)) {
      itemMap.set(itemId, {
        id: itemId,
        name: itemName,
        subItems: new Map(), // 중분류 중복 방지를 위해 Map 사용
      });
    }

    const item = itemMap.get(itemId);

    if (!subItemId) return;

    if (!item.subItems.has(subItemId)) {
      item.subItems.set(subItemId, {
        id: subItemId,
        name: subItemName,
        details: [],
      });
    }

    const subItem = item.subItems.get(subItemId);

    if (!detailId) return;

    // 상세 질문 중복 삽입 방지 로직
    const exists = subItem.details.some((detail) => detail.id === detailId);
    if (!exists) {
      subItem.details.push({
        id: detailId,
        question_text: questionText,
      });
    }
  });

  // 조립된 Map 데이터를 프론트엔드가 그리기 쉬운 Array 형태로 변환하여 반환
  return {
    version_id: currentVid,
    items: Array.from(itemMap.values()).map((item) => ({
      ...item,
      subItems: Array.from(item.subItems.values()),
    })),
  };
};

const itemAdd = async ({ item_name, version_id }) => {
  if (!version_id || !item_name) {
    throw new Error("필수 데이터가 누락되었습니다.");
  }

  const result = await surveyMapper.insertItem({ item_name, version_id });

  return {
    item_id: result.insertId, // mariadb는 객체 프로퍼티로 바로 insertId를 줍니다.
    item_name,
    version_id,
    subItems: [],
  };
};

const subItemAdd = async ({ sub_item_name, item_id }) => {
  if (!item_id) {
    throw new Error("상위 항목이 필요합니다.");
  }

  const result = await surveyMapper.insertSubItem({ sub_item_name, item_id });

  return {
    sub_item_id: result.insertId,
    sub_item_name,
    item_id,
  };
};

const registerDetail = async (params) => {
  const result = await surveyMapper.insertSurveyDetail(params);

  return {
    detail_id: result.insertId,
    question_text: params.question_text,
    sub_item_id: params.sub_item_id,
  };
};

const deleteSelected = async (itemIds, subIds, detailIds) => {
  // 💡 실무 원칙: RDBMS에서 삭제를 할 때는 자식 데이터를 먼저 지워야 참조 무결성(FK) 제약에 걸리지 않습니다.
  // Detail -> SubItem -> Item 역순으로 지웁니다.
  if (detailIds.length > 0) await surveyMapper.deleteDetails(detailIds);
  if (subIds.length > 0) await surveyMapper.deleteSubItems(subIds);
  if (itemIds.length > 0) await surveyMapper.deleteItems(itemIds);
};

const getSurveyVersions = async () => {
  const versions = await surveyMapper.getVersions();
  return toArray(versions);
};

const makeNewSurveyVersion = async (versionId) => {
  return surveyMapper.createNewVersion(versionId);
};

const getActiveSurvey = async () => {
  const activeVid = await surveyMapper.getActiveVersionId();
  if (!activeVid) {
    return { version_id: null, items: [] }; // 활성화된 버전이 없으면 빈 껍데기 반환
  }
  return getSurveyStructure(activeVid);
};

module.exports = {
  getSurveyStructure,
  itemAdd,
  subItemAdd,
  registerDetail,
  deleteSelected,
  getSurveyVersions,
  makeNewSurveyVersion,
  getActiveSurvey,
};
