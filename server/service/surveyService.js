// services/surveyService.js
const surveyMapper = require("../database/mappers/survey_mapper");

const getSurveyStructure = async () => {
  const rawData = await surveyMapper.selectSurvey();

  // 1. 데이터가 아예 없는 경우 방어 로직
  if (!rawData || (Array.isArray(rawData) && rawData.length === 0)) {
    return { items: [], version_id: null };
  }

  // ⭐️ 핵심: 단일 객체면 [ ]로 감싸고, 이미 배열이면 그대로 씁니다.
  const rows = Array.isArray(rawData) ? rawData : [rawData];

  // 2. ⭐️ 추가: 버전 정보 추출 (모든 행에 동일하게 들어있으므로 첫 번째 행에서 가져옴)
  // SQL에서 VERSION_ID를 조회하도록 수정했다면 row.VERSION_ID로 접근 가능합니다.
  const versionId = rows[0].VERSION_ID || rows[0].version_id;

  const itemMap = new Map();

  rows.forEach((row) => {
    // 테이블 정의서에 따른 대문자/소문자 컬럼명 대응 (ERD 기준 대문자 권장)
    const itemId = row.ITEM_ID || row.item_id;
    const itemName = row.ITEM_NAME || row.item_name;
    const subItemId = row.SUB_ITEM_ID || row.sub_item_id;
    const subItemName = row.SUB_ITEM_NAME || row.sub_item_name;
    const detailId = row.DETAIL_ID || row.detail_id;
    const questionText = row.QUESTION_TEXT || row.question_text;

    if (!itemId) return; // 항목이 없으면 다음 행으로

    if (!itemMap.has(itemId)) {
      itemMap.set(itemId, {
        id: itemId,
        name: itemName,
        subItems: new Map(),
      });
    }

    const item = itemMap.get(itemId);

    if (subItemId) {
      if (!item.subItems.has(subItemId)) {
        item.subItems.set(subItemId, {
          id: subItemId,
          name: subItemName,
          details: [],
        });
      }
      const subItem = item.subItems.get(subItemId);

      // detail_id가 있을 때만 중복 없이 추가
      if (detailId) {
        // 이미 추가된 상세 질문인지 확인 (Join 결과 특성상 중복 행 발생 방지)
        const isDuplicate = subItem.details.some((d) => d.id === detailId);
        if (!isDuplicate) {
          subItem.details.push({
            id: detailId,
            question_text: questionText,
          });
        }
      }
    }
  });

  // 3. Map을 배열 구조로 최종 변환
  const finalItems = Array.from(itemMap.values()).map((item) => ({
    ...item,
    subItems: Array.from(item.subItems.values()),
  }));

  // 4. ⭐️ 팩트: 프론트엔드가 요구하는 '봉투' 구조로 반환
  return {
    version_id: versionId, // 이제 프론트의 currentVersion.value가 이 값을 잡습니다.
    items: finalItems, // surveyData.value에 들어갈 배열
  };
};

// services/surveyService.js

const itemAdd = async (data) => {
  try {
    const { item_name, version_id } = data;

    if (!version_id || !item_name) {
      throw new Error("필수 데이터(이름 또는 버전ID)가 누락되었습니다.");
    }

    // DB 하나로 끝내기 (서브쿼리 방식)
    const result = await surveyMapper.insertItem({ item_name, version_id });

    // 화면에 즉시 추가하기 위해 생성된 ID와 함께 리턴
    return {
      item_id: result.insertId,
      item_name,
      version_id,
      subItems: [], // 프론트엔드 구조용
    };
  } catch (err) {
    throw new Error("ItemAdd Service Error: " + err.message);
  }
};

const subItemAdd = async (data) => {
  try {
    const { sub_item_name, item_id } = data;
    if (!item_id) throw new Error("부모 항목(Item ID)이 선택되지 않았습니다.");

    const result = await surveyMapper.insertSubItem({ sub_item_name, item_id });

    return {
      sub_item_id: result.insertId,
      sub_item_name,
      item_id,
    };
  } catch (err) {
    throw new Error("SubItemAdd Error: " + err.message);
  }
};

// survey_service.js
const registerDetail = async (params) => {
  const result = await surveyMapper.insertSurveyDetail(params);

  // 서브아이템 패턴과 동일하게 작성
  return {
    detail_id: result.insertId, // 생성된 PK (서브아이턴의 sub_item_id 역할)
    question_text: params.question_text, // 질문 내용
    sub_item_id: params.sub_item_id, // 부모 ID
  };
};

// survey_service.js
const deleteSelected = async (itemIds, subIds, detailIds) => {
  // 1. 가장 하위인 질문(Detail)부터 삭제
  if (detailIds.length > 0) {
    await surveyMapper.deleteDetails(detailIds);
  }
  // 2. 서브항목 삭제
  if (subIds.length > 0) {
    await surveyMapper.deleteSubItems(subIds);
  }
  // 3. 최상위 항목 삭제
  if (itemIds.length > 0) {
    await surveyMapper.deleteItems(itemIds);
  }
};

module.exports = {
  getSurveyStructure,
  itemAdd,
  subItemAdd,
  registerDetail,
  deleteSelected,
};
