const express = require("express"); // 웹 서버의 뼈대인 Express 프레임워크를 가져옵니다.
const router = express.Router(); // 길 찾기(라우팅) 전용 도구를 생성합니다.
const mgMyPageService = require("../service/mgmypage_service"); // 실제 비즈니스 로직을 처리할 요리사(Service)를 부릅니다.
const bcrypt = require("bcrypt"); // 사용자가 입력한 비번과 DB의 암호화된 비번을 대조해주는 도구입니다.

// 1. [조회] GET /api/mgmypage/:id - "내 정보를 보여줘!"라는 요청을 처리합니다.
router.get("/:id", async (req, res) => {
  try {
    // 주소창(URL) 끝에 붙어온 사용자 ID(예: /api/mgmypage/admin123)를 변수에 담습니다.
    const userId = req.params.id;

    // 만약 ID가 없다면 "누구 정보를 찾을지 모르겠어!"라며 400 에러(잘못된 요청)를 보냅니다.
    if (!userId) {
      return res.status(400).json({ message: "사용자 ID가 필요합니다." });
    }

    // 서비스 요리사에게 "이 사람 정보랑 업무 통계 좀 가져다줘"라고 부탁합니다.
    const data = await mgMyPageService.getMyPageData(userId);

    // 성공하면 가져온 데이터를 봉투(JSON)에 예쁘게 담아서 프론트엔드로 보냅니다.
    res.status(200).json(data);
  } catch (error) {
    // 예상치 못한 사고가 나면 터미널에 로그를 남기고 사용자에게는 500 에러(서버 오류)를 알립니다.
    console.error("Router Error (mgmypage):", error);
    res.status(500).json({ message: "서버 내부 오류가 발생했습니다." });
  }
});

// 2. [수정] PUT /api/mgmypage/update - "내 정보를 수정할게!"라는 요청을 처리합니다.
router.put("/update", async (req, res) => {
  try {
    // 프론트엔드에서 보낸 데이터 뭉치(이름, 이메일, 현재비번 등)를 통째로 받습니다.
    const userData = req.body;

    // [체크!] 본인 확인을 위해 "현재 비밀번호"가 반드시 들어있어야 합니다.
    if (!userData.currentPassword) {
      return res.status(400).json({ message: "현재 비밀번호를 입력해주세요." });
    }

    // --- [보안 단계 1: 진짜 주인이 맞는지 DB에서 정보 가져오기] ---
    // 수정 요청을 한 사람의 ID로 DB에 저장된 진짜 정보(암호화된 비번 포함)를 불러옵니다.
    const user = await mgMyPageService.getMyPageData(userData.userId);

    // DB에 해당 사용자 정보가 아예 없거나 비밀번호 데이터가 유실됐다면 거절합니다.
    if (!user || !user.profile || !user.profile.password) {
      return res
        .status(404)
        .json({ message: "사용자의 비밀번호 정보를 찾을 수 없습니다." });
    }

    // --- [보안 단계 2: 비밀번호 대조 작업] ---
    // 사용자가 방금 입력한 '날것의 비번'과 DB의 '암호화된 비번'이 짝이 맞는지 bcrypt로 비교합니다.
    const isMatch = await bcrypt.compare(
      userData.currentPassword,
      user.profile.password,
    );

    // 비밀번호가 틀렸다면 서비스(Service) 단계로 넘어가지도 못하게 여기서 차단합니다.
    if (!isMatch) {
      return res.json({
        success: false,
        message: "현재 비밀번호가 일치하지 않습니다.",
      });
    }

    // --- [보안 단계 3: 최종 수정 실행] ---
    // 본인 확인이 끝났으니, 이제 서비스 요리사에게 "진짜로 정보를 수정해줘"라고 시킵니다.
    // 이때 서비스는 '새 비밀번호'가 있다면 암호화해서 DB에 넣을 준비를 할 거예요.
    const result = await mgMyPageService.updateMyPageData(userData);

    // 모든 수정이 완료되면 최종 성공 보고서를 프론트엔드에 보냅니다.
    res.status(200).json(result);
  } catch (error) {
    console.error("Router Error (update):", error);
    res.status(500).json({ message: "수정 중 오류 발생" });
  }
});

// 이 라우터 규칙들을 외부(app.js 등)에서 사용할 수 있게 문을 열어둡니다.
module.exports = router;
