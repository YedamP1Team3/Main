const express = require("express"); // 웹 서버 구축을 위한 익스프레스 모듈을 가져옵니다.
const router = express.Router(); // 주소(경로)를 분배해주는 라우터 객체를 만듭니다.
const service = require("../service/recipient_service"); // 실제 비즈니스 로직을 처리할 서비스를 가져옵니다.

// 1. [등록] POST /api/recipient/register - 새로운 대상자를 등록하는 입구
router.post("/register", async (req, res) => {
  try {
    // 프론트엔드에서 보낸 바구니(body) 안에 들어있는 보호자 ID를 확인합니다.
    const familyId = req.body.family_id;

    // 만약 보호자 ID가 없다면 "누가 등록하는지 모르겠어요!"라고 400 에러를 보냅니다.
    if (!familyId) {
      return res
        .status(400)
        .json({ message: "보호자 ID(family_id)가 누락되었습니다." });
    }

    // 서비스에게 입력 데이터와 보호자 ID를 넘겨주며 등록을 시킵니다.
    const result = await service.registerRecipient(req.body, familyId);

    // 성공하면 서비스가 준 결과(성공 여부 등)를 프론트엔드에 응답합니다.
    res.status(200).json(result);
  } catch (err) {
    // 서버 내부에서 문제가 생기면 500 에러를 보냅니다.
    res.status(500).json({ success: false, message: "등록 실패" });
  }
});

// 2. [목록 조회] GET /api/recipient/list/:family_id - 내가 등록한 명단을 가져오는 경로
router.get("/list/:family_id", async (req, res) => {
  try {
    // 주소창(URL)에 담긴 family_id(예: aksen123)를 쏙 뽑아냅니다.
    const { family_id } = req.params;

    // 서비스에게 이 ID와 연결된 대상자 명단을 가져오라고 시킵니다.
    const result = await service.getRecipientList(family_id);

    if (result.success) {
      res.status(200).json(result); // 명단 찾기 성공 시 데이터를 돌려줍니다.
    } else {
      res.status(400).json(result); // 실패 시 에러 내용을 보냅니다.
    }
  } catch (err) {
    console.error("목록 조회 중 에러:", err);
    res.status(500).json({ success: false, message: "목록 로드 실패" });
  }
});

// 3. [한 건 조회] GET /api/recipient/:id - 특정 대상자의 상세 정보를 가져옵니다.
router.get("/:id", async (req, res) => {
  try {
    // 주소창의 고유 ID(req.params.id)를 사용해 서비스에 상세 정보를 요청합니다.
    const result = await service.getRecipientDetail(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "데이터 로드 실패" });
  }
});

// 4. [수정] PUT /api/recipient/:id - 기존 대상자 정보를 덮어씁니다.
router.put("/:id", async (req, res) => {
  try {
    // 주소창의 ID와 수정할 내용(req.body)을 서비스에 넘겨줍니다.
    const result = await service.updateRecipient(req.params.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: "수정 실패" });
  }
});

// 이 라우터 설정들을 메인 서버(app.js)에서 사용할 수 있게 내보냅니다.
module.exports = router;
