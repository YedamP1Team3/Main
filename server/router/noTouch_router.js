const express = require("express");
const router = express.Router();
const noTouch_service = require("../service/noTouch_service");

router.get("/bene", async (req, res) => {
  let managerId = req.query.user_id;
  let result = await noTouch_service.BeneList(managerId);
  res.send(result);
});

router.get("/bene/:id", async (req, res) => {
  let target = req.params.id;
  let result = await noTouch_service.BeneDetail(target);
  res.send(result);
});
router.get("/managers", async (req, res) => {
  try {
    const managers = await noTouch_service.getManagerList();

    res.status(200).json({
      success: true,
      data: managers,
    });
  } catch (error) {
    console.error("담당자 목록 조회 에러:", error);
    res.status(500).json({
      success: false,
      message: "담당자 목록을 불러오는 중 서버 오류가 발생했습니다.",
    });
  }
});

// ==========================================
// 2. 담당자 배정 (업데이트) API
// ==========================================
router.put("/assign-manager", async (req, res) => {
  const { bene_id, manager_id } = req.body;

  try {
    // 서비스 로직 호출
    await noTouch_service.assignManagerToBene(bene_id, manager_id);

    res.status(200).json({
      success: true,
      message: "담당자가 성공적으로 배정/수정되었습니다.",
    });
  } catch (error) {
    console.error("담당자 배정 에러:", error);

    // Service에서 던진 에러 종류에 따라 응답 코드 분기
    if (error.message === "MISSING_PARAM") {
      return res.status(400).json({
        success: false,
        message: "대상자 ID 또는 담당자 ID가 누락되었습니다.",
      });
    }

    if (error.message === "NOT_FOUND") {
      return res
        .status(404)
        .json({ success: false, message: "해당 대상자를 찾을 수 없습니다." });
    }

    res.status(500).json({
      success: false,
      message: "담당자 배정 중 서버 오류가 발생했습니다.",
    });
  }
});
module.exports = router;
