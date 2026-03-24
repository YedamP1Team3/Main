const express = require("express");
const router = express.Router();
const dependentService = require("../service/Dependent_service.js");

// POST: /api/dependent/add
router.post("/add", async (req, res) => {
  try {
    const result = await dependentService.registerDependent(req.body);
    res.status(200).json({
      success: true,
      message: "지원대상자가 성공적으로 등록되었습니다.",
      data: result,
    });
  } catch (err) {
    console.error("Router Error:", err);
    res.status(500).json({
      success: false,
      message: "서버 오류로 인해 등록에 실패했습니다.",
    });
  }
});

module.exports = router;
