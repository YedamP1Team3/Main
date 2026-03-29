const express = require("express");
const router = express.Router();

const rsvService = require("../service/rsv_service.js");

//담당자 ID 조회
router.get("/manager-id", async (req, res) => {
  try {
    // 나중에는 로그인 정보로 대체
    const loginUserId = req.user?.userId || "family_01";
    const loginUserRole = req.user?.role || "FAMILY";

    const { beneId } = req.query;

    const managerId = await rsvService.resolveManagerId({
      loginUserId,
      loginUserRole,
      beneId,
    });

    res.status(200).json({
      success: true,
      managerId,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get('/beneficiaries', async (req, res) => {
  try {
    // const familyId = req.user.userId;
    const familyId = 'sskk00';
    // 또는 지금 테스트 단계면 const familyId = 'family_01';

    const list = await rsvService.getBeneficiariesByFamilyId(familyId);

    res.status(200).json({
      success: true,
      data: list
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// -----------------------------------managerSchedule REST--------------------------

// 다음 달 스케줄 수동 생성 테스트용
router.post("/schedule/auto-generate", async (req, res) => {
  try {
    const result = await rsvService.generateNextMonthSchedules();

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// 담당자 ID 조회 () + 예약가능 시간 조회 (MANAGER_ID, WORK_DATE)
router.get("/schedule", async (req, res) => {
  try {
    const managerId = "manager_02";

    // (ex: ?date=2026-03-24)
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "date 파라미터가 필요합니다.",
      });
    }

    const schedule = await rsvService.getManagerSchedule(managerId, date);
    res.status(200).json({
      success: true,
      schedule,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// 담당자 일정조정(예약불가) (MANAGER_ID)
router.post("/blocked-times", async (req, res) => {
  try {
    const managerId = "manager_02";

    const { date, times } = req.body;

    if (!date || !times || times.length === 0) {
      return res.status(400).json({
        success: false,
        message: "date와 times가 필요합니다.",
      });
    }

    await rsvService.createBlockedTimes(managerId, date, times);

    res.status(200).json({
      success: true,
      message: "예약불가 시간 등록 완료",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// 예약 가능 처리 (예약불가 해제)
router.delete("/unblock-times", async (req, res) => {
  try {
    const managerId = "manager_02";
    const { date, times } = req.body; // times: ["09:30", "10:00", ...]

    if (!date || !times || times.length === 0) {
      return res.status(400).json({
        success: false,
        message: "date와 times가 필요합니다.",
      });
    }

    const removed = await rsvService.removeBlockedTimes(managerId, date, times);

    res.status(200).json({
      success: true,
      message: "예약 가능 처리 완료",
      removed,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
