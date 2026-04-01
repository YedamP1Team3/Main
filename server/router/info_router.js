const express = require("express"); // 웹 서버의 기본 뼈대인 Express를 가져옵니다.
const router = express.Router(); // 길 찾기(라우팅) 기능을 담당하는 객체를 만듭니다.
const infoService = require("../service/info_service.js"); // 실제 업무를 처리할 서비스(Service)를 불러옵니다.

// 1. [회원가입] POST /api/info/signup - 새로운 회원 정보를 등록하는 입구
router.post("/signup", async (req, res) => {
  const userData = req.body; // 사용자가 회원가입 양식에 쓴 전체 데이터를 받습니다.

  try {
    // 서비스에게 "이 데이터로 회원가입 시켜줘"라고 부탁합니다.
    const result = await infoService.userSignup(userData);

    // 서비스 결과가 'success'라면 201번(성공적으로 생성됨) 코드와 메시지를 보냅니다.
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

// 2. [로그인] POST /api/info/login - 아이디/비번을 확인하고 문을 열어주는 곳
router.post("/login", async (req, res) => {
  try {
    // 서비스에게 "로그인 정보 맞는지 확인해줘"라고 시킵니다.
    const user = await infoService.userLogin(req.body);

    if (user) {
      // 로그인이 성공하면, 화면에서 필요한 유저 정보(이름, 역할 등)를 봉투에 담아 보냅니다.
      res.status(200).send({
        message: "로그인 성공",
        user: {
          name: user.user_name,
          role: user.role,
          id: user.user_id,
          agency_id: user.agency_id,
          agency_name: user.agency_name,
          zip_code: user.zip_code,
          address: user.address,
          detail_address: user.detail_address,
        },
      });
    } else {
      // 일치하는 정보가 없으면 401번(인증 실패) 코드를 보냅니다.
      res.status(401).send({ message: "아이디 또는 비밀번호가 틀렸습니다." });
    }
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).send({ message: "서버 오류" });
  }
});

// 3. [중복 체크] GET /api/info/check-id/:userId - 사용 가능한 아이디인지 실시간 확인
router.get("/check-id/:userId", async (req, res) => {
  try {
    const { userId } = req.params; // 주소창에 들어있는 ID값을 읽어옵니다.
    // 서비스에게 "이 아이디 쓰는 사람 있어?"라고 물어봅니다.
    const isAvailable = await infoService.checkIdAvailability(userId);
    res.json({ isAvailable }); // 사용 가능하면 true, 아니면 false를 대답해줍니다.
  } catch (error) {
    console.error("Router Error:", error);
    res.status(500).send(error.message);
  }
});

// 4. [정보 조회] GET /api/info/user-detail/:userId - 수정 페이지용 내 정보 불러오기
router.get("/user-detail/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    // 서비스에게 "이 사람 상세 정보 다 가져와줘"라고 시킵니다.
    const userDetail = await infoService.getUserDetail(userId);

    if (userDetail) {
      res.status(200).json(userDetail); // 정보를 찾으면 데이터 봉투를 전달합니다.
    } else {
      res.status(404).send({ message: "사용자를 찾을 수 없습니다." });
    }
  } catch (err) {
    console.error("Fetch User Error:", err);
    res.status(500).send({ message: "서버 오류" });
  }
});

// 5. [정보 수정] PUT /api/info/update-user - 바뀐 정보를 DB에 덮어쓰기
router.put("/update-user", async (req, res) => {
  try {
    const updateData = req.body; // 수정된 새 정보를 받습니다.
    // 서비스에게 "이 새 정보로 데이터 업데이트해줘"라고 시킵니다.
    const result = await infoService.updateUser(updateData);

    if (result.status === "success") {
      res.status(200).send({ message: "수정 완료 !" });
    } else {
      res.status(400).send({ message: "수정 실패." });
    }
  } catch (err) {
    console.error("Update User Error:", err);
    res.status(500).send({ message: "서버 오류" });
  }
});

module.exports = router; // 이 라우터 설정을 메인 서버 파일(app.js 등)에서 쓸 수 있게 내보냅니다.
