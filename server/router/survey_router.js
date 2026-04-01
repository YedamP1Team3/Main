const express = require("express");
const router = express.Router();
const surveyService = require("../service/surveyService");

// 설문 구조 관리 API
router.get("/versions", async (req, res) => {
  try {
    const versions = await surveyService.getSurveyVersions();
    res.status(200).json({ success: true, versions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { versionId } = req.query;

    if (!versionId) {
      return res.status(400).json({ message: "versionId가 필요합니다." });
    }

    const result = await surveyService.getSurveyStructure(versionId);
    res.status(200).json(result);
  } catch (error) {
    console.error("설문 구조 조회 실패:", error);
    res.status(500).json({
      message: "서버 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

router.post("/item", async (req, res) => {
  try {
    const result = await surveyService.itemAdd(req.body);
    res.status(200).json({ success: true, item: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/item/sub", async (req, res) => {
  try {
    const result = await surveyService.subItemAdd(req.body);
    res.status(200).json({ success: true, item: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/details", async (req, res) => {
  try {
    const params = {
      sub_item_id: req.body.sub_item_id,
      question_text: req.body.question_text,
    };

    const data = await surveyService.registerDetail(params);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("상세 질문 추가 실패:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/delete-selected", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "삭제할 ID가 없습니다.",
      });
    }

    const itemIds = [];
    const subIds = [];
    const detailIds = [];

    ids.forEach((rawId) => {
      const [type, pk] = rawId.split("-");

      if (type === "item") itemIds.push(pk);
      if (type === "sub") subIds.push(pk);
      if (type === "detail") detailIds.push(pk);
    });

    await surveyService.deleteSelected(itemIds, subIds, detailIds);
    res.json({ success: true });
  } catch (error) {
    console.error("설문 구조 삭제 실패:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/version/new", async (req, res) => {
  try {
    const { versionId } = req.body;
    const newVersionId = await surveyService.makeNewSurveyVersion(versionId);
    res.status(200).json({ success: true, newVersionId });
  } catch (error) {
    console.error("설문 버전 생성 실패:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// member 신청서 API
router.get("/active_survey", async (req, res) => {
  try {
    const result = await surveyService.getActiveSurvey();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("활성 설문 조회 실패:", error);
    res.status(500).json({
      success: false,
      message: "활성 설문지를 불러오지 못했습니다.",
    });
  }
});

router.post("/submit", async (req, res) => {
  try {
    const appId = await surveyService.submitSurveyResult(req.body);

    res.status(200).json({
      success: true,
      message: "지원신청서가 성공적으로 저장되었습니다.",
      app_id: appId,
    });
  } catch (error) {
    console.error("지원신청서 제출 실패:", error);
    res.status(500).json({
      success: false,
      message: "신청서 저장 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

router.get("/result/:appId", async (req, res) => {
  try {
    const { appId } = req.params;
    const result = await surveyService.getApplicationDetail(appId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("신청서 상세 조회 실패:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/list/:beneId", async (req, res) => {
  try {
    const { beneId } = req.params;
    const list = await surveyService.getApplicationListByBene(beneId);
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    console.error("신청서 목록 조회 실패:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/application/:appId", async (req, res) => {
  try {
    await surveyService.deleteSurveyApplication(req.params.appId);
    res.status(200).json({
      success: true,
      message: "신청서가 삭제되었습니다.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
