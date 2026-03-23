// 회원가입 처리
const userSignup = async (userData) => {
  const {
    userId,
    organization,
    password,
    name,
    userType,
    zipcode,
    address,
    detailAddress,
    phone,
    email,
  } = userData;

  // 비밀번호 암호화
  const hashedPassword = await bcrypt.hash(password, 10);

  let agency_no = 101;
  if (organization === "기관 A") agency_no = 100;
  else if (organization === "기관 B") agency_no = 101;

  // Mapper에 전달할 데이터 배열
  const signupData = [
    userId,
    agency_no,
    hashedPassword,
    name,
    userType === "일반이용자" ? "FAMILY" : "AGENCY",
    "PENDING",
    zipcode,
    address + " " + detailAddress,
    phone,
    email,
  ];

  try {
    const result = await userMapper.insertUser(signupData);
    return {
      status: result.affectedRows > 0 ? "success" : "fail",
      user_id: userId,
    };
  } catch (err) {
    console.error("서비스 단 에러 로그:", err);
    throw err;
  }
};

// 로그인 처리
const userLogin = async (loginData) => {
  const { userId, password } = loginData;

  try {
    const user = await userMapper.selectUserById(userId);

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
    }
    return null;
  } catch {
    err;
  }
  {
    console.error("Login Sercice Error:", err);
    throw err;
  }
};

module.exports = {
  userSignup,
  userLogin,
};
