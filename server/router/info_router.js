router.post("/signup", async (req, res) => {
  const type = req.params.type;
  const userData = req.body;

  try {
    let result = await userService.userSignup(userData, type);
    if (result.affectedRows > 0) {
      res.status(201).send({ message: "회원가입이 완료되었습니다." });
    } else {
      res.status(400).send({ message: "가입에 실패했습니다." });
    }
  } catch (err) {
    console.error("Signup Error:", err);
    res
      .status(500)
      .send({ message: "서버 오류가 발생했습니다.", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const loginData = req.body;

  try {
    let user = await userService.userLogin(loginData);

    if (user) {
      res.status(200).send({
        message: "로그인 성공",
        user: { name: user.name, type: user.user_type, id: user.user_id },
      });
    } else {
      res.status(401).send({ message: "아이디 또는 비밀번호가 틀렸습니다." });
    }
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).send({ message: "서버 오류가 발생했습니다." });
  }
});

router.get("/check-id/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const isAvailble = await userService.checkIdAvailability(userId);
    res.send({ available: isAvailble });
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
