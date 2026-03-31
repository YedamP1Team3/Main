// router/mgmypage_router.js
const express = require("express");
const router = express.Router();
const mgMyPageService = require("../service/mgmypage_service");

// GET /api/mgmypage/:id
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id; // URL에서 전달된 :id 값을 가져옴

    if (!userId) {
      return res.status(400).json({ message: "사용자 ID가 필요합니다." });
    }

    // 서비스 호출하여 데이터 가져오기
    const data = await mgMyPageService.getMyPageData(userId);

    // 성공 응답 전송
    res.status(200).json(data);
  } catch (error) {
    console.error("Router Error (mgmypage):", error);
    res.status(500).json({ message: "서버 내부 오류가 발생했습니다." });
  }
});

router.put("/update", async (req, res) => {
  try {
    const userData = req.body; // 프론트에서 보낸 memberForm.value 데이터

    if (!userData || !userData.userId) {
      return res.status(400).json({ message: "사용자 ID가 필요합니다." });
    }

    const result = await mgMyPageService.updateMyPageData(userData);
    res.status(200).json(result);
  } catch (error) {
    console.error("Router Error (update):", error);
    res.status(500).json({ message: "수정 중 오류 발생" });
  }
});

module.exports = router;
