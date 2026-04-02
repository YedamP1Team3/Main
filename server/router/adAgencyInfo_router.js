const express = require("express");
const router = express.Router();
const service = require("../service/adAgencyInfo_service.js");

router.get("/center-info/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await service.getCenterInfo(userId);

    if (result) {
      res.json(result);
    } else {
      res
        .status(404)
        .json({ message: "해당 사용자의 기관 정보를 찾을 수 없습니다." });
    }
  } catch (err) {
    console.error("Router 조회 에러:", err);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

router.put("/center-info", async (req, res) => {
  try {
    const agencyData = req.body;
    const result = await service.updateCenterInfo(agencyData);

    res.json(result);
  } catch (err) {
    console.error("Router 수정 에러:", err);
    res.status(500).json({ success: false, message: "수정 중 서버 오류 발생" });
  }
});

module.exports = router;
