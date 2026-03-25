const express = require("express"); // 익스프레스 모듈 로드
const router = express.Router(); // 라우터 객체 생성
const service = require("../service/recipient_service"); // 서비스 로드

// POST 방식의 /register 경로 설정
router.post("/register", async (req, res) => {
  try {
    // 🔐 핵심: 로그인 세션에서 현재 사용자의 ID를 가져옵니다.

    // (세션 사용 시 보통 req.session.user_id 형태입니다)

    const familyId = req.body.family_id;

    if (!familyId) {
      return res
        .status(400)
        .json({ message: "보호자 ID(family_id)가 누락되었습니다." });
    }

    // 서비스 호출 시 body와 familyId를 전달합니다.
    const result = await service.registerRecipient(req.body, familyId);

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: "등록 실패" });
  }
});
