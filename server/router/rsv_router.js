const express = require("express");
const router = express.Router();

const rsvService = require("../service/rsv_service.js");

// 담당자 ID 조회 () + 예약가능 시간 조회 (MANAGER_ID, WORK_DATE)
router.get("/schedule", async (req, res) => {
  try {
    // 일단 테스트니까 하드코딩
    const managerId = "manager_02";

    // 날짜는 쿼리로 받는 게 좋음 (ex: ?date=2026-03-24)
    const { date } = req.query;
    console.log("rsv.router.date : ", date);

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

module.exports = router;
