// routes/surveyRouter.js
const express = require("express");
const router = express.Router();
const surveyService = require("../service/surveyService");

router.get("/", async (req, res) => {
  try {
    const result = await surveyService.getSurveyStructure();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "서버 오류 발생", error: err.message });
  }
});

// routes/survey.js (또는 해당 라우터 파일)

// 항목 추가 API
router.post("/item", async (req, res) => {
  try {
    const result = await surveyService.itemAdd(req.body);
    res.status(200).json({ success: true, item: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/item/sub", async (req, res) => {
  try {
    const result = await surveyService.subItemAdd(req.body);
    res.status(200).json({ success: true, item: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// survey_router.js
router.post("/details", async (req, res) => {
  try {
    console.log("입력 데이터(body):", req.body); // 1. 프론트에서 데이터가 잘 왔나?

    const params = {
      sub_item_id: req.body.sub_item_id,
      question_text: req.body.question_text,
    };

    console.log("정리된 params:", params); // 2. 서비스로 넘길 데이터 확인

    const data = await surveyService.registerDetail(params);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("❌ 백엔드 실제 에러 로그:", error); // 3. 여기서 진짜 원인이 찍힘!
    res.status(500).json({ success: false, message: error.message });
  }
});

// survey_router.js
router.delete("/delete-selected", async (req, res) => {
  try {
    const { ids } = req.body;
    console.log("서버 수신 IDs:", ids); // 2. 여기서 데이터가 안 찍히면 프론트 호출 문제

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
    console.error("라우터 에러:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
