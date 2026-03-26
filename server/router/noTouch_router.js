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

// 대기단계
// 1. 대기단계 조회 (GET)
router.get("/priority/:bene_id", async (req, res) => {
  const bene_id = req.params.bene_id;

  try {
    const priorityData = await noTouch_service.getPriority(bene_id);

    // 프론트에서 res.data.data 로 꺼내 쓸 수 있도록 맞춰줍니다[cite: 8].
    res.status(200).json({
      success: true,
      data: priorityData, // 데이터가 없으면 null 반환
    });
  } catch (error) {
    console.error("대기단계 조회 에러:", error);
    if (error.message === "MISSING_PARAM") {
      return res
        .status(400)
        .json({ success: false, message: "대상자 ID가 누락되었습니다." });
    }
    res.status(500).json({
      success: false,
      message: "대기단계 정보를 불러오는 중 서버 오류가 발생했습니다.",
    });
  }
});

// 2. 대기단계 승인 요청 (POST)
router.post("/priority/request", async (req, res) => {
  const { bene_id, priority_status } = req.body;

  try {
    await noTouch_service.requestPriority(bene_id, priority_status);
    console.log("🔥 [Router] 프론트에서 온 값:", req.body);

    res.status(200).json({
      success: true,
      message: "대기단계 승인 요청이 완료되었습니다.",
    });
  } catch (error) {
    console.error("대기단계 요청 에러:", error);
    if (error.message === "MISSING_PARAM") {
      return res
        .status(400)
        .json({ success: false, message: "필수 파라미터가 누락되었습니다." });
    }
    res.status(500).json({
      success: false,
      message: "대기단계 요청 중 서버 오류가 발생했습니다.",
    });
  }
});

// 3. 대기단계 취소 (POST)
// (프론트엔드 스토어에서 axios.post('/priority/cancel') 로 호출하도록 짜두었으므로 POST로 받습니다)
router.post("/priority/cancel", async (req, res) => {
  const { bene_id } = req.body;

  try {
    await noTouch_service.cancelPriority(bene_id);

    res.status(200).json({
      success: true,
      message: "대기단계 신청이 취소되었습니다.",
    });
  } catch (error) {
    console.error("대기단계 취소 에러:", error);
    if (error.message === "MISSING_PARAM") {
      return res
        .status(400)
        .json({ success: false, message: "대상자 ID가 누락되었습니다." });
    }
    res.status(500).json({
      success: false,
      message: "대기단계 취소 중 서버 오류가 발생했습니다.",
    });
  }
});
module.exports = router;
