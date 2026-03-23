const express = require("express");
const router = express.Router();
const userService = require("../service/info_service.js");

// 회원가입
router.post("/signup", async (req, res) => {
  const userData = req.body; // 프론트에서 보낸 데이터 전체

  try {
    // 인자를 userData 하나만 전달하도록 수정
    const result = await userService.userSignup(userData);

    // 서비스에서 { status: "success", ... } 형태로 리턴하므로 조건문 수정
    if (result.status === "success") {
      res.status(201).send({ message: "회원가입이 완료되었습니다." });
    } else {
      res.status(400).send({ message: "가입에 실패했습니다." });
    }
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).send({ message: "서버 오류", error: err.message });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  try {
    const user = await userService.userLogin(req.body);

    if (user) {
      // DB 컬럼명에 맞춰서 응답 (user_name, role 등 DB 컬럼명 확인 필요)
      res.status(200).send({
        message: "로그인 성공",
        user: {
          name: user.user_name,
          role: user.role,
          id: user.user_id,
        },
      });
    } else {
      res.status(401).send({ message: "아이디 또는 비밀번호가 틀렸습니다." });
    }
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).send({ message: "서버 오류" });
  }
});

module.exports = router;
