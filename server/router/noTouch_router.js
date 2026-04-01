const express = require("express");
const router = express.Router();
const noTouchService = require("../service/noTouch_service");

// 지원대상자 기본 조회
router.get("/bene", async (req, res) => {
  const managerId = req.query.user_id;
  const result = await noTouchService.BeneList(managerId);
  res.send(result);
});

router.get("/bene/:id", async (req, res) => {
  const target = req.params.id;
  const result = await noTouchService.BeneDetail(target);
  res.send(result);
});

// 담당자 배정 관련 API
router.get("/managers", async (req, res) => {
  try {
    const managers = await noTouchService.getManagerList();

    res.status(200).json({
      success: true,
      data: managers,
    });
  } catch (error) {
    console.error("담당자 목록 조회 실패:", error);
    res.status(500).json({
      success: false,
      message: "담당자 목록을 불러오는 중 서버 오류가 발생했습니다.",
    });
  }
});

router.put("/assign-manager", async (req, res) => {
  const { bene_id, manager_id } = req.body;

  try {
    await noTouchService.assignManagerToBene(bene_id, manager_id);

    res.status(200).json({
      success: true,
      message: "담당자 배정이 완료되었습니다.",
    });
  } catch (error) {
    console.error("담당자 배정 실패:", error);

    if (error.message === "MISSING_PARAM") {
      return res.status(400).json({
        success: false,
        message: "지원대상자 ID 또는 담당자 ID가 누락되었습니다.",
      });
    }

    if (error.message === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "대상자를 찾을 수 없습니다.",
      });
    }

    res.status(500).json({
      success: false,
      message: "담당자 배정 중 서버 오류가 발생했습니다.",
    });
  }
});

// 대기단계(우선순위) 관련 API
router.get("/priority/:bene_id", async (req, res) => {
  const beneId = req.params.bene_id;

  try {
    const priorityData = await noTouchService.getPriority(beneId);

    res.status(200).json({
      success: true,
      data: priorityData,
    });
  } catch (error) {
    console.error("대기단계 조회 실패:", error);

    if (error.message === "MISSING_PARAM") {
      return res.status(400).json({
        success: false,
        message: "지원대상자 ID가 누락되었습니다.",
      });
    }

    res.status(500).json({
      success: false,
      message: "대기단계 정보를 불러오는 중 서버 오류가 발생했습니다.",
    });
  }
});

router.post("/priority/request", async (req, res) => {
  const { bene_id, priority_status } = req.body;

  try {
    await noTouchService.requestPriority(bene_id, priority_status);

    res.status(200).json({
      success: true,
      message: "대기단계 승인 요청이 완료되었습니다.",
    });
  } catch (error) {
    console.error("대기단계 요청 실패:", error);

    if (error.message === "MISSING_PARAM") {
      return res.status(400).json({
        success: false,
        message: "필수 파라미터가 누락되었습니다.",
      });
    }

    res.status(500).json({
      success: false,
      message: "대기단계 요청 중 서버 오류가 발생했습니다.",
    });
  }
});

router.post("/priority/cancel", async (req, res) => {
  const { bene_id } = req.body;

  try {
    await noTouchService.cancelPriority(bene_id);

    res.status(200).json({
      success: true,
      message: "대기단계 요청이 취소되었습니다.",
    });
  } catch (error) {
    console.error("대기단계 취소 실패:", error);

    if (error.message === "MISSING_PARAM") {
      return res.status(400).json({
        success: false,
        message: "지원대상자 ID가 누락되었습니다.",
      });
    }

    res.status(500).json({
      success: false,
      message: "대기단계 취소 중 서버 오류가 발생했습니다.",
    });
  }
});

// admin 전용 승인/반려 API
router.post("/admin/priority/approve", async (req, res) => {
  const { bene_id } = req.body;

  try {
    await noTouchService.adminApprovePriority(bene_id);
    res.status(200).json({
      success: true,
      message: "관리자 승인이 완료되었습니다.",
    });
  } catch (error) {
    console.error("관리자 승인 실패:", error);

    if (error.message === "MISSING_PARAM") {
      return res.status(400).json({
        success: false,
        message: "지원대상자 ID가 누락되었습니다.",
      });
    }

    if (error.message === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "승인 가능한 대기단계 요청을 찾을 수 없습니다.",
      });
    }

    res.status(500).json({
      success: false,
      message: "서버 내부 오류가 발생했습니다.",
    });
  }
});

router.post("/admin/priority/reject", async (req, res) => {
  const { bene_id, reason } = req.body;

  try {
    await noTouchService.adminRejectPriority(bene_id, reason);
    res.status(200).json({
      success: true,
      message: "관리자 반려 처리가 완료되었습니다.",
    });
  } catch (error) {
    console.error("관리자 반려 실패:", error);

    if (error.message === "MISSING_PARAM") {
      return res.status(400).json({
        success: false,
        message: "지원대상자 ID 또는 반려 사유가 누락되었습니다.",
      });
    }

    if (error.message === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "반려 가능한 대기단계 요청을 찾을 수 없습니다.",
      });
    }

    res.status(500).json({
      success: false,
      message: "서버 내부 오류가 발생했습니다.",
    });
  }
});

router.get("/admin/priority/reject-history/:bene_id", async (req, res) => {
  const beneId = req.params.bene_id;

  try {
    const historyData = await noTouchService.getAdminRejectHistory(beneId);
    res.status(200).json({
      success: true,
      data: historyData,
    });
  } catch (error) {
    console.error("반려 이력 조회 실패:", error);

    if (error.message === "MISSING_PARAM") {
      return res.status(400).json({
        success: false,
        message: "지원대상자 ID가 누락되었습니다.",
      });
    }

    res.status(500).json({
      success: false,
      message: "서버 내부 오류가 발생했습니다.",
    });
  }
});

module.exports = router;
