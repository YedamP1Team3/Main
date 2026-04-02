const express = require("express"); // 웹 서버의 길을 만들어주는 도구를 가져옵니다.
const bcrypt = require("bcrypt"); // 비밀번호를 암호화하거나 대조하는 보안 도구를 가져옵니다.
const router = express.Router(); // 주소(경로)를 설정하는 라우터 객체를 생성합니다.
const service = require("../service/admypage_service.js"); // 실제 일을 처리하는 '지배인(서비스)'을 불러옵니다.

// 1. [정보 조회] GET /api/admypage/:id - 내 정보를 화면에 뿌려주기 위해 호출합니다.
router.get("/:id", async (req, res) => {
  try {
    // 주소창에 들어온 ID(req.params.id)를 서비스에 넘겨서 유저 정보를 찾습니다.
    const result = await service.findAdminById(req.params.id);

    if (result) {
      res.json(result); // 정보를 찾았다면 그 데이터를 프론트엔드(Vue)로 보내줍니다.
    } else {
      // 정보가 없다면 404 에러와 함께 메시지를 보냅니다.
      res.status(404).send({ message: "관리자 정보를 찾을 수 없습니다" });
    }
  } catch (err) {
    console.error("Router 에러:", err);
    res.status(500).send({ message: "서버 오류 발생" }); // 서버 자체에 문제가 생겼을 때입니다.
  }
});

// 2. [정보 수정] PUT /api/admypage/update - 수정한 정보를 저장할 때 호출합니다.
router.put("/update", async (req, res) => {
  const data = req.body; // 프론트엔드에서 보낸 폼 데이터(이름, 비번 등)를 통째로 받습니다.
  try {
    // [보안 단계 1] 먼저 DB에 저장된 현재 비밀번호(해시값)를 가져옵니다.
    const user = await service.checkPassword(data.user_id);

    // [보안 단계 2] 사용자가 입력한 현재 비번과 DB의 비번이 맞는지 대조합니다.
    const isMatch = await bcrypt.compare(data.currentPassword, user.password);

    // 유저가 없거나 비밀번호가 틀렸다면 수정을 거부합니다.
    if (!user || !isMatch) {
      return res.json({
        success: false,
        message: "현재 비밀번호가 일치하지 않습니다.",
      });
    }

    // [수정 단계 1] 이름, 연락처 같은 기본 정보들을 먼저 업데이트합니다.
    await service.modifyAdmin(data);

    // [수정 단계 2] 만약 새 비밀번호(newPassword)를 입력했다면?
    if (data.newPassword) {
      // 새 비밀번호를 해킹당해도 알 수 없게 암호화(Hashing)합니다.
      const hashedPassword = await bcrypt.hash(data.newPassword, 10);

      // 암호화된 아주 복잡한 문자열을 DB에 저장합니다.
      await service.modifyPassword(data.user_id, hashedPassword);
    }

    // 모든 과정이 끝나면 성공 신호를 보냅니다.
    res.json({ success: true, message: "수정 완료!" });
  } catch (err) {
    console.error("Update Router 에러:", err);
    res.status(500).json({ success: false, message: "서버 저장 중 오류 발생" });
  }
});

module.exports = router; // 설정한 경로들을 메인 서버(app.js)에서 쓸 수 있게 내보냅니다.
