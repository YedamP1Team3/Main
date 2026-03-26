const express = require("express");
const router = express.Router();
const surveyService = require("../service/surveyService");

// 1. [조회] 전체 버전 목록 (구체적인 경로를 가장 위로 올립니다)
router.get("/versions", async (req, res) => {
  try {
    const versions = await surveyService.getSurveyVersions();
    res.status(200).json({ success: true, versions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. [조회] 특정 버전의 상세 구조 (항목, 세부항목, 질문)
router.get("/", async (req, res) => {
  try {
    const { versionId } = req.query; // ✅ 구조 분해 할당으로 깔끔하게 선언

    if (!versionId) {
      return res.status(400).json({ message: "versionId가 필요합니다." });
    }

    const result = await surveyService.getSurveyStructure(versionId);
    res.status(200).json(result);
  } catch (err) {
    console.error("라우터 에러:", err);
    res.status(500).json({ message: "서버 오류 발생", error: err.message });
  }
});

// 3. [추가] 조사지 항목(Item) 추가
router.post("/item", async (req, res) => {
  try {
    const result = await surveyService.itemAdd(req.body);
    res.status(200).json({ success: true, item: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. [추가] 세부 항목(SubItem) 추가
router.post("/item/sub", async (req, res) => {
  try {
    const result = await surveyService.subItemAdd(req.body);
    res.status(200).json({ success: true, item: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. [추가] 상세 질문(Detail) 추가
router.post("/details", async (req, res) => {
  try {
    const params = {
      sub_item_id: req.body.sub_item_id,
      question_text: req.body.question_text,
    };
    const data = await surveyService.registerDetail(params);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("❌ 상세 질문 추가 에러:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. [삭제] 선택된 항목들 일괄 삭제
router.delete("/delete-selected", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "ID가 없습니다." });
    }

    const itemIds = [],
      subIds = [],
      detailIds = [];

    for (const idGroup of ids) {
      const [type, pk] = idGroup.split("-");
      if (type === "item") itemIds.push(pk);
      else if (type === "sub") subIds.push(pk);
      else if (type === "detail") detailIds.push(pk);
    }

    await surveyService.deleteSelected(itemIds, subIds, detailIds);
    res.json({ success: true });
  } catch (err) {
    console.error("삭제 라우터 에러:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// routes/surveyRouter.js
// POST 바디에서 versionId를 받아 Service로 넘깁니다.
router.post("/version/new", async (req, res) => {
  try {
    const { versionId } = req.body;
    const newVersionId = await surveyService.makeNewSurveyVersion(versionId);
    res.status(200).json({ success: true, newVersionId });
  } catch (err) {
    console.error("라우터 에러:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Member 조사지 불러오기
router.get("/active_survey", async (req, res) => {
  try {
    // 프론트에서 받을 파라미터(req.query)는 없습니다.
    // 서비스에게 "알아서 활성화된 거 가져와"라고 지시만 합니다.
    const result = await surveyService.getActiveSurvey();

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("❌ [Router 에러] 활성 설문지 조회 실패:", err);
    res
      .status(500)
      .json({ success: false, message: "활성 설문지를 불러오지 못했습니다." });
  }
});

// [추가] 7. 지원신청서 및 조사지 답변 제출 (POST)
router.post("/submit", async (req, res) => {
  try {
    // 프론트에서 보낸 데이터(req.body)를 서비스로 넘김
    // 예상 구조: { bene_id: 1, version_id: 1, user_id: 'test_user', answers: { '상세내용ID': true/false, ... } }
    const appId = await surveyService.submitSurveyResult(req.body);

    res.status(200).json({
      success: true,
      message: "신청서가 성공적으로 저장되었습니다.",
      app_id: appId,
    });
  } catch (err) {
    console.error("❌ [Router 에러] 설문 제출 실패:", err);
    res.status(500).json({
      success: false,
      message: "신청서 저장 중 오류가 발생했습니다.",
      error: err.message,
    });
  }
});

// [조회] 8. 특정 신청서의 상세 내용 및 답변 불러오기
router.get("/result/:appId", async (req, res) => {
  try {
    const { appId } = req.params;
    const result = await surveyService.getApplicationDetail(appId);

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("❌ [Router 에러] 조회 실패:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/list/:beneId", async (req, res) => {
  try {
    const { beneId } = req.params;
    const list = await surveyService.getApplicationListByBene(beneId);

    res.status(200).json({ success: true, data: list });
  } catch (err) {
    console.error("❌ [Router 에러] 리스트 조회 실패:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
router.delete("/application/:appId", async (req, res) => {
  try {
    await surveyService.deleteSurveyApplication(req.params.appId);
    res.status(200).json({ success: true, message: "삭제되었습니다." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
module.exports = router;
