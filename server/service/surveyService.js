// services/surveyService.js
const surveyMapper = require("../database/mappers/survey_mapper");

const getSurveyStructure = async (versionId) => {
  // 1. 매퍼를 통해 DB 데이터 조회 (인자로 받은 versionId 사용)
  const rawData = await surveyMapper.selectSurvey(versionId);

  // 2. 데이터가 없는 경우 방어 로직
  if (!rawData || (Array.isArray(rawData) && rawData.length === 0)) {
    // version_id는 null 대신 요청받은 versionId를 반환하여 프론트 상태 유지를 돕습니다.
    return { items: [], version_id: versionId };
  }

  // ⭐️ 핵심: 결과가 단일 객체면 배열로 변환
  const rows = Array.isArray(rawData) ? rawData : [rawData];

  // 3. 🚨 [수정 완료] 변수명 충돌 해결
  // 함수 매개변수인 versionId와 겹치지 않도록 'currentVid' 등으로 이름을 변경합니다.
  const currentVid = rows[0].VERSION_ID || rows[0].version_id;

  const itemMap = new Map();

  rows.forEach((row) => {
    const itemId = row.ITEM_ID || row.item_id;
    const itemName = row.ITEM_NAME || row.item_name;
    const subItemId = row.SUB_ITEM_ID || row.sub_item_id;
    const subItemName = row.SUB_ITEM_NAME || row.sub_item_name;
    const detailId = row.DETAIL_ID || row.detail_id;
    const questionText = row.QUESTION_TEXT || row.question_text;

    if (!itemId) return;

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

      if (detailId) {
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

  // 4. Map을 배열 구조로 변환
  const finalItems = Array.from(itemMap.values()).map((item) => ({
    ...item,
    subItems: Array.from(item.subItems.values()),
  }));

  // 5. 프론트엔드가 요구하는 구조로 반환
  return {
    version_id: currentVid, // 수정된 변수명 적용
    items: finalItems,
  };
};

const itemAdd = async (data) => {
  try {
    const { item_name, version_id } = data;

    if (!version_id || !item_name) {
      throw new Error("필수 데이터(이름 또는 버전ID)가 누락되었습니다.");
    }

    const result = await surveyMapper.insertItem({ item_name, version_id });

    return {
      item_id: result.insertId,
      item_name,
      version_id,
      subItems: [],
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

const registerDetail = async (params) => {
  try {
    const result = await surveyMapper.insertSurveyDetail(params);
    return {
      detail_id: result.insertId,
      question_text: params.question_text,
      sub_item_id: params.sub_item_id,
    };
  } catch (err) {
    throw new Error("RegisterDetail Error: " + err.message);
  }
};

const deleteSelected = async (itemIds, subIds, detailIds) => {
  try {
    if (detailIds.length > 0) await surveyMapper.deleteDetails(detailIds);
    if (subIds.length > 0) await surveyMapper.deleteSubItems(subIds);
    if (itemIds.length > 0) await surveyMapper.deleteItems(itemIds);
  } catch (err) {
    throw new Error("DeleteSelected Error: " + err.message);
  }
};

const getSurveyVersions = async () => {
  try {
    const versions = await surveyMapper.getVersions();
    return Array.isArray(versions) ? versions : [versions];
  } catch (err) {
    throw new Error("GetSurveyVersions Error: " + err.message);
  }
};

/**
 * 새 설문 버전을 생성하는 서비스 로직
 * 1. 기존 활성 버전을 찾아 비활성화(IS_ACTIVE=0)
 * 2. 새로운 버전 레코드 생성(IS_ACTIVE=1)
 */
// 1. 함수가 정의되어 있는지 확인
const makeNewSurveyVersion = async () => {
  try {
    return await surveyMapper.createNewVersion();
  } catch (err) {
    throw new Error(err.message);
  }
};

//member용
const getActiveSurvey = async () => {
  console.log("👉 [Service] 사용자용 활성 설문지 데이터 조립 시작");

  try {
    // 1. 매퍼에게 활성화된 버전 ID를 물어봅니다.
    const activeVid = await surveyMapper.getActiveVersionId();

    if (!activeVid) {
      console.log("⚠️ [Service] 현재 활성화된 설문지 버전이 없습니다.");
      return { version_id: null, items: [] };
    }

    console.log(
      `👉 [Service] 찾은 활성 버전 ID: ${activeVid}. 기존 만능 함수(getSurveyStructure) 재활용 시작!`,
    );

    // 2. 💡 핵심: 우리가 예전에 고생해서 짜둔 구조화 함수에 찾은 ID를 쏙 넣어줍니다.
    // 그러면 알아서 DB 조인 쿼리를 돌고, 항목>세부항목>질문 구조로 예쁘게 포장해서 돌려줍니다!
    const result = await getSurveyStructure(activeVid);

    return result;
  } catch (err) {
    console.error("❌ [Service 에러] 활성 설문지 데이터 조립 중 에러:", err);
    throw new Error(err.message);
  }
};

const submitSurvey = async (payload) => {
  // 프론트엔드에서 던져줄 데이터를 꺼냅니다.
  const { versionId, beneId, userId, answers } = payload;

  console.log("👉 [Service] 신청서 제출 로직 시작");

  // 1. 최소한의 안전 검사 (데이터가 제대로 왔는가?)
  if (!versionId || !beneId || !answers) {
    throw new Error("필수 데이터가 누락되었습니다.");
  }

  // 2. 답변 객체 { "1": true, "2": false } 를 Mapper가 쓰기 좋게 배열로 변환
  // Object.entries 를 쓰면 키와 값을 배열로 뽑아낼 수 있습니다.
  const answersArray = Object.entries(answers).map(
    ([detailId, answerValue]) => {
      return {
        detailId: Number(detailId), // 키 값은 문자열로 넘어오므로 숫자로 변환
        answerValue: answerValue === true || answerValue === "true" ? 1 : 0, // DB boolean 처리를 위해 1, 0으로 변환
      };
    },
  );

  if (answersArray.length === 0) {
    throw new Error("선택된 답변이 하나도 없습니다.");
  }

  // 3. 포장된 데이터를 Mapper로 전달
  const newAppId = await surveyMapper.submitSurveyApplication(
    versionId,
    beneId,
    userId,
    answersArray,
  );
  return newAppId;
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
  submitSurvey,
};
