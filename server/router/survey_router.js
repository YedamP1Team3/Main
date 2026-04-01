// routes/survey.js
const express = require("express");
const router = express.Router();

// 앞서 만든 Facade를 불러옵니다. Router는 비즈니스 로직을 몰라도 됩니다.
const surveyService = require("../service/surveyService");

// ==========================================
// [설문 구조 관리 API]
// ==========================================

router.get("/versions", async (req, res) => {
  try {
    const versions = await surveyService.getSurveyVersions();
    // 💡 실무 원칙: 성공 시 무조건 data 키에 결과값을 담습니다.
    res.status(200).json({ success: true, data: versions });
  } catch (error) {
    // 💡 실무 원칙: Service/Mapper에서 던진 에러 메시지를 프론트로 안전하게 전달합니다.
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { versionId } = req.query;

    if (!versionId) {
      // 400 Bad Request: 클라이언트가 필수 파라미터를 빼먹었을 때
      return res
        .status(400)
        .json({ success: false, message: "versionId가 필요합니다." });
    }

    const result = await surveyService.getSurveyStructure(versionId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("설문 구조 조회 실패:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/item", async (req, res) => {
  try {
    const result = await surveyService.itemAdd(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/item/sub", async (req, res) => {
  try {
    const result = await surveyService.subItemAdd(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/details", async (req, res) => {
  try {
    // 필요한 파라미터만 명시적으로 추출하여 Service로 넘깁니다. (보안 목적)
    const params = {
      sub_item_id: req.body.sub_item_id,
      question_text: req.body.question_text,
    };

    const result = await surveyService.registerDetail(params);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("상세 질문 추가 실패:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/delete-selected", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "삭제할 ID가 없습니다." });
    }

    const itemIds = [];
    const subIds = [];
    const detailIds = [];

    // 프론트엔드에서 'item-1', 'sub-2' 형태로 보낸 복합 키를 분리하여 분류합니다.
    ids.forEach((rawId) => {
      const [type, pk] = rawId.split("-");
      if (type === "item") itemIds.push(pk);
      if (type === "sub") subIds.push(pk);
      if (type === "detail") detailIds.push(pk);
    });

    await surveyService.deleteSelected(itemIds, subIds, detailIds);
    // 삭제 성공 시 특별한 반환 데이터가 없으므로 data는 null 등으로 처리하거나 생략 후 success만 보냅니다.
    res.status(200).json({ success: true, data: null });
  } catch (error) {
    console.error("설문 구조 삭제 실패:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/version/new", async (req, res) => {
  try {
    const { versionId } = req.body;
    const newVersionId = await surveyService.makeNewSurveyVersion(versionId);
    // 객체 형태로 data 안에 감싸서 보냅니다.
    res.status(200).json({ success: true, data: { newVersionId } });
  } catch (error) {
    console.error("설문 버전 생성 실패:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// [대상자(Member) 신청서 API]
// ==========================================

router.get("/active_survey", async (req, res) => {
  try {
    const result = await surveyService.getActiveSurvey();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("활성 설문 조회 실패:", error);
    // 사용자 친화적인 메시지로 덮어쓰고 싶다면 여기서 처리할 수도 있습니다.
    res
      .status(500)
      .json({ success: false, message: "활성 설문지를 불러오지 못했습니다." });
  }
});

router.post("/submit", async (req, res) => {
  try {
    const appId = await surveyService.submitSurveyResult(req.body);

    res.status(200).json({
      success: true,
      data: {
        app_id: appId,
        message: "지원신청서가 성공적으로 저장되었습니다.",
      },
    });
  } catch (error) {
    console.error("지원신청서 제출 실패:", error);
    // Service에서 던진 "이미 진행 중인..." 같은 비즈니스 에러 메시지가 프론트로 그대로 넘어갑니다.
    res.status(500).json({ success: false, message: error.message });
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
    res
      .status(200)
      .json({ success: true, data: { message: "신청서가 삭제되었습니다." } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
