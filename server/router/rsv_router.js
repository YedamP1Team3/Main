const express = require("express");
const router = express.Router();

const rsvService = require("../service/rsv_service.js");

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
