// services/surveyService.js
const surveyMapper = require("../database/mappers/survey_mapper");

const getSurveyStructure = async () => {
  const rawData = await surveyMapper.selectSurvey();

  if (!rawData) return { items: [] };

  // ⭐️ 핵심: 단일 객체면 [ ]로 감싸고, 이미 배열이면 그대로 씁니다.
  const rows = Array.isArray(rawData) ? rawData : [rawData];

  const itemMap = new Map();

  rows.forEach((row) => {
    // null 체크 추가 (데이터가 비어있을 경우 대비)
    if (!row.item_id) return;

    if (!itemMap.has(row.item_id)) {
      itemMap.set(row.item_id, {
        id: row.item_id,
        name: row.item_name,
        subItems: new Map(),
      });
    }

    const item = itemMap.get(row.item_id);

    if (row.sub_item_id) {
      if (!item.subItems.has(row.sub_item_id)) {
        item.subItems.set(row.sub_item_id, {
          id: row.sub_item_id,
          name: row.sub_item_name,
          details: [],
        });
      }
      const subItem = item.subItems.get(row.sub_item_id);

      // detail_id가 null이 아닐 때만 push
      if (row.detail_id) {
        subItem.details.push({
          id: row.detail_id,
          title: row.question_text,
        });
      }
    }
  });

  // Map을 배열 구조로 변환
  const finalItems = Array.from(itemMap.values()).map((item) => ({
    ...item,
    subItems: Array.from(item.subItems.values()),
  }));

  return {
    items: finalItems,
  };
};
module.exports = { getSurveyStructure };
