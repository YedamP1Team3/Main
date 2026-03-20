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

module.exports = router;
