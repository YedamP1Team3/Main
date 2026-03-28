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

// 사용자 상세 정보 조회
const getUserDetail = async (userId) => {
  try {
    const user = await infoMapper.selectUserById(userId);
    if (user) {
      // 보안을 위해 비밀번호는 제외하고 반환
      const { password, ...userDetail } = user;
      return userDetail;
    }
    return null;
  } catch (err) {
    console.error("상세조회 서비스 에러:", err);
    throw err;
  }
};

// 사용자 정보 업데이트
const updateUser = async (data) => {
  try {
    // [추가/수정 시작] 비밀번호 입력 여부에 따른 분기 처리 -------------------------
    if (data.newPassword && data.newPassword.trim() !== "") {
      // 1. 새 비밀번호가 있을 경우: 암호화 후 전용 Mapper 호출
      const hashedPassword = await bcrypt.hash(data.newPassword, 10);
      const updateParams = [
        data.name,
        data.phone,
        data.email,
        data.postcode,
        data.address,
        data.detailAddress,
        hashedPassword, // 암호화된 비밀번호 추가
        data.id,
      ];
      await infoMapper.updateUserWithPassword(updateParams); // 비밀번호 포함 쿼리
    } else {
      // 2. 새 비밀번호가 없을 경우: 기존 정보만 수정 (기존 로직 유지)
      const updateParams = [
        data.name,
        data.phone,
        data.email,
        data.postcode,
        data.address,
        data.detailAddress,
        data.id,
      ];
      await infoMapper.updateUser(updateParams);
    }
    // [추가/수정 끝] --------------------------------------------------------

    return { status: "success" };
  } catch (err) {
    console.error("업데이트 서비스 에러:", err);
    throw err;
  }
};

module.exports = {
  userSignup,
  userLogin,
  checkIdAvailability,
  getUserDetail,
  updateUser,
};
