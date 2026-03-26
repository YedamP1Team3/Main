const infoMapper = require("../database/mappers/info_mappers.js");
const bcrypt = require("bcrypt");

// 1. 회원가입 처리
const userSignup = async (userData) => {
  try {
    console.log("서비스가 받은 데이터:", userData);

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const signupData = [
      userData.user_id,
      userData.agency_id,
      hashedPassword,
      userData.user_name,
      userData.role,
      "PENDING",
      userData.zip_code,
      userData.address,
      userData.detail_address,
      userData.tel,
      userData.email,
    ];

    console.log("최종 DB로 들어가는 배열:", signupData);
    await infoMapper.insertUser(signupData);

    return { status: "success", user_id: userData.user_id };
  } catch (err) {
    console.error("회원가입 서비스 에러:", err);
    throw err;
  }
};

// 2. 로그인 처리
const userLogin = async (loginData) => {
  try {
    const user = await infoMapper.selectUserById(loginData.userId);
    if (user) {
      const isMatch = await bcrypt.compare(loginData.password, user.password);
      if (isMatch) {
        // [이 부분을 수정합니다]
        // password를 제외한 모든 데이터를 복사해서 보냅니다.
        const { password, ...userClean } = user;

        return userClean;
      }
    }
    return null;
  } catch (err) {
    console.error("로그인 에러:", err);
    throw err;
  }
};

// ✅ 아이디 중복 여부 확인 로직 (안전하게 수정)
const checkIdAvailability = async (userId) => {
  try {
    const count = await infoMapper.countUserId(userId);
    // count가 0이면 중복 없음(true), 1 이상이면 중복 있음(false)
    return count === 0;
  } catch (err) {
    console.error("중복체크 서비스 에러:", err);
    throw err;
  }
};

module.exports = { userSignup, userLogin, checkIdAvailability };
