const userMapper = require("../database/mappers/info_mappers.js");
const bcrypt = require("bcrypt");

// 1. 회원가입 처리
const userSignup = async (userData) => {
  try {
    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // [중요] DB 에러 방지용: agency_no가 100, 101이 DB에 없으면 그냥 null로 보냅니다.
    // 일반 유저는 소속 기관이 없을 수 있으니까요.
    let agency_no = null;
    if (userData.organization === "기관 A") agency_no = 100;
    if (userData.organization === "기관 B") agency_no = 101;

    // DB에 들어갈 순서대로 배열 만들기 (가장 단순한 형태)
    const signupData = [
      userData.userId,
      agency_no,
      hashedPassword,
      userData.name,
      userData.userType === "일반이용자" ? "FAMILY" : "AGENCY",
      "PENDING",
      userData.zipcode,
      userData.address + " " + (userData.detailAddress || ""),
      userData.phone,
      userData.email,
    ];

    const result = await userMapper.insertUser(signupData);

    return { status: "success", user_id: userData.userId };
  } catch (err) {
    console.error("회원가입 에러:", err);
    throw err;
  }
};

// 2. 로그인 처리
const userLogin = async (loginData) => {
  try {
    // 아이디로 유저 찾기
    const user = await userMapper.selectUserById(loginData.userId);

    if (user) {
      // 비밀번호 비교
      const isMatch = await bcrypt.compare(loginData.password, user.password);
      if (isMatch) {
        // 비밀번호만 빼고 나머지 정보 넘겨주기
        delete user.password;
        return user;
      }
    }
    return null; // 아이디가 없거나 비번이 틀리면 null
  } catch (err) {
    console.error("로그인 에러:", err);
    throw err;
  }
};

module.exports = { userSignup, userLogin };
