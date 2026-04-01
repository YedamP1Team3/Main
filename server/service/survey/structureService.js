const surveyMapper = require("../../database/mappers/survey_mapper");

const toArray = (value) => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

const getSurveyStructure = async (versionId) => {
  const rows = toArray(await surveyMapper.selectSurvey(versionId));

  if (rows.length === 0) {
    return { items: [], version_id: versionId };
  }

  const currentVid = rows[0].VERSION_ID || rows[0].version_id;
  const itemMap = new Map();

  rows.forEach((row) => {
    const itemId = row.ITEM_ID || row.item_id;
    const itemName = row.ITEM_NAME || row.item_name;
    const subItemId = row.SUB_ITEM_ID || row.sub_item_id;
    const subItemName = row.SUB_ITEM_NAME || row.sub_item_name;
    const detailId = row.DETAIL_ID || row.detail_id;
    const questionText = row.QUESTION_TEXT || row.question_text;

    if (!itemId) {
      return;
    }

    if (!itemMap.has(itemId)) {
      itemMap.set(itemId, {
        id: itemId,
        name: itemName,
        subItems: new Map(),
      });
    }

    const item = itemMap.get(itemId);

    if (!subItemId) {
      return;
    }

    if (!item.subItems.has(subItemId)) {
      item.subItems.set(subItemId, {
        id: subItemId,
        name: subItemName,
        details: [],
      });
    }

    const subItem = item.subItems.get(subItemId);

    if (!detailId) {
      return;
    }

    const exists = subItem.details.some((detail) => detail.id === detailId);

    if (!exists) {
      subItem.details.push({
        id: detailId,
        question_text: questionText,
      });
    }
  });

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
    item_id: result.insertId,
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
  if (detailIds.length > 0) {
    await surveyMapper.deleteDetails(detailIds);
  }

  if (subIds.length > 0) {
    await surveyMapper.deleteSubItems(subIds);
  }

  if (itemIds.length > 0) {
    await surveyMapper.deleteItems(itemIds);
  }
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
    return { version_id: null, items: [] };
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
