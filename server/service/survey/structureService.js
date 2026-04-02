const surveyMapper = require("../../database/mappers/survey_mapper");

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const getSurveyStructure = async (versionId) => {
  if (!versionId) {
    throw createError(400, "version_id가 필요합니다.");
  }

  const rows = await surveyMapper.selectSurvey(versionId);

  if (rows.length === 0) {
    return {
      version_id: versionId,
      items: [],
    };
  }

  const itemMap = new Map();

  rows.forEach((row) => {
    if (!row.item_id) {
      return;
    }

    // SQL 결과는 item, sub_item, detail이 한 줄에 평평하게 섞여 내려온다.
    // 하지만 프론트는 "항목 -> 세부항목 -> 질문" 트리 구조가 더 다루기 쉽다.
    // 그래서 service에서 Map으로 묶어 Vue 컴포넌트가 바로 쓰기 좋은 형태로 만든다.
    if (!itemMap.has(row.item_id)) {
      itemMap.set(row.item_id, {
        id: row.item_id,
        name: row.item_name,
        subItems: new Map(),
      });
    }

    if (!row.sub_item_id) {
      return;
    }

    const item = itemMap.get(row.item_id);

    if (!item.subItems.has(row.sub_item_id)) {
      item.subItems.set(row.sub_item_id, {
        id: row.sub_item_id,
        name: row.sub_item_name,
        details: [],
      });
    }

    if (!row.detail_id) {
      return;
    }

    const subItem = item.subItems.get(row.sub_item_id);

    subItem.details.push({
      id: row.detail_id,
      question_text: row.question_text,
    });
  });

  return {
    version_id: rows[0].version_id,
    items: Array.from(itemMap.values()).map((item) => ({
      ...item,
      subItems: Array.from(item.subItems.values()),
    })),
  };
};

const itemAdd = async ({ item_name, version_id }) => {
  if (!item_name || !version_id) {
    throw createError(400, "item_name과 version_id는 필수입니다.");
  }

  const result = await surveyMapper.insertItem({ item_name, version_id });

  return {
    item_id: result.insertId,
    item_name,
    version_id,
    subItems: [],
  };
};

const subItemAdd = async ({ sub_item_name, item_id }) => {
  if (!sub_item_name || !item_id) {
    throw createError(400, "sub_item_name과 item_id는 필수입니다.");
  }

  const result = await surveyMapper.insertSubItem({ sub_item_name, item_id });

  return {
    sub_item_id: result.insertId,
    sub_item_name,
    item_id,
  };
};

const registerDetail = async ({ sub_item_id, question_text }) => {
  if (!sub_item_id || !question_text) {
    throw createError(400, "sub_item_id와 question_text는 필수입니다.");
  }

  const result = await surveyMapper.insertSurveyDetail({
    sub_item_id,
    question_text,
  });

  return {
    detail_id: result.insertId,
    question_text,
    sub_item_id,
  };
};

const deleteSelected = async (itemIds, subIds, detailIds) => {
  // 삭제는 가장 하위 detail부터 시작한다.
  // 질문이 남아 있는 상태에서 상위 sub_item/item을 먼저 지우면
  // 참조 관계가 깨질 수 있어 계층 역순으로 처리하는 편이 안전하다.
  if (detailIds.length > 0) {
    await surveyMapper.deleteDetails(detailIds);
  }

  if (subIds.length > 0) {
    await surveyMapper.deleteSubItems(subIds);
  }

  if (itemIds.length > 0) {
    await surveyMapper.deleteItems(itemIds);
  }

  return true;
};

const getSurveyVersions = async () => {
  return surveyMapper.getVersions();
};

const makeNewSurveyVersion = async (versionId) => {
  return surveyMapper.createNewVersion(versionId);
};

const getActiveSurvey = async () => {
  const activeVersionId = await surveyMapper.getActiveVersionId();

  if (!activeVersionId) {
    return {
      version_id: null,
      items: [],
    };
  }

  return getSurveyStructure(activeVersionId);
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
