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

// 프론트에서 넘어온 aksen123 같은 ID를 받아 목록을 돌려줌
router.get("/list/:family_id", async (req, res) => {
  try {
    const { family_id } = req.params; // URL 파라미터에서 ID 추출

    // 서비스(service) 레이어에 DB 조회를 요청함
    const result = await service.getRecipientList(family_id);

    if (result.success) {
      res.status(200).json(result); // DB 데이터 반환
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    console.error("목록 조회 중 에러:", err);
    res.status(500).json({ seccess: false, message: "목록 로드 실패" });
  }
});

module.exports = router;
