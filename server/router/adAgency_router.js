const express = require("express");
const router = express.Router();
const service = require("../service/adAgency_service.js");

// 기관 정보 조회
router.get("/center-info/:id", async (req, res) => {
  try {
    const result = await service.findAgencyByAdminId(req.params.id);
    console.log("조회된 결과:", result); // 데이터가 실제로 넘어오는지 터미널에 찍어봄
    if (result) res.json(result);
    else res.status(404).send({ message: "정보 없음" });
  } catch (err) {
    console.error("!!! SERVER ERROR !!!");
    console.error(err); // 에러 스택 전체를 터미널에 강제로 출력
    res.status(500).send(err.message);
  }
});

// 기관 정보 수정
router.put("/center-info", async (req, res) => {
  try {
    const result = await service.modifyAgencyInfo(req.body);
    res.json({ success: true, result });
  } catch (err) {
    console.error("Router Error:", err);
    res.status(500).send(err.message);
  }
});

module.exports = router;
