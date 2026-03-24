const express = require("express");
const router = express.Router();

const rsvService = require("../service/rsv_service.js");

// 담당자 ID 조회 () + 예약 날짜 + 시간 조회 (MANAGER_ID)
router.get("/schedule", async (req, res) => {
  try {
    const userId = "manager_02";

    const manager = await rsvService.getManagerId(userId);

    if (!manager) {
      return res.status(404).json({
        message: "담당자를 찾을 수 없습니다.",
      });
    }
    const schedule = await rsvService.getManagerSchedule(manager.user_id);

    res.status(200).json({
      manager: manager.user_id,
      // success: true,
      schedule,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "서버 오류 발생",
      error: err.message,
    });
  }
});

// 예약 가능 여부 변경 (MANAGER_ID, SLOT_DATETIME)

// 예약신청 등록

// 예약신청 거절

module.exports = router;
