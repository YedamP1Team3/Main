const infoMapper = require("../database/mappers/info_mappers.js"); // 창고지기(Mapper)를 불러옵니다.
const bcrypt = require("bcrypt"); // 비밀번호를 안전하게 암호화하거나 대조하는 도구입니다.

// 1. [회원가입] 사용자가 입력한 정보를 정리해서 DB에 넣는 과정입니다.
const userSignup = async (userData) => {
  try {
    console.log("서비스가 받은 데이터:", userData);

    // [보안] 비밀번호를 그대로 저장하면 위험하므로, 10번 꼬아서 암호화(Hash)합니다.
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // DB에 들어갈 순서대로 데이터를 예쁘게 줄 세웁니다.
    const signupData = [
      userData.user_id,
      userData.agency_id,
      hashedPassword, // 으깨진 비밀번호를 넣습니다.
      userData.user_name,
      userData.role,
      "PENDING", // 가입 직후 상태는 '승인 대기'로 설정합니다.
      userData.zip_code,
      userData.address,
      userData.detail_address,
      userData.tel,
      userData.email,
    ];

    console.log("최종 DB로 들어가는 배열:", signupData);
    // 매퍼에게 이 데이터를 창고에 넣어달라고 시킵니다.
    await infoMapper.insertUser(signupData);

    return { status: "success", user_id: userData.user_id };
  } catch (err) {
    console.error("회원가입 서비스 에러:", err);
    throw err;
  }
};

// 2. [로그인] 아이디와 비밀번호가 맞는지 확인하는 과정입니다.
const userLogin = async (loginData) => {
  try {
    // 먼저 입력한 아이디로 DB에서 회원 정보를 찾아옵니다.
    const user = await infoMapper.selectUserById(loginData.userId);

    if (user) {
      // DB에 저장된 암호문(Hash)과 사용자가 입력한 비번을 대조합니다.
      const isMatch = await bcrypt.compare(loginData.password, user.password);

      if (isMatch) {
        // [보안] 로그인이 성공하면, 비밀번호만 쏙 빼고 나머지 정보만 돌려줍니다.
        const { password, ...userClean } = user;
        return userClean;
      }
    }
    // 정보가 없거나 비번이 틀리면 아무것도 안 줍니다(null).
    return null;
  } catch (err) {
    console.error("로그인 에러:", err);
    throw err;
  }
};

// 3. [중복 확인] 이미 쓰고 있는 아이디인지 확인합니다.
const checkIdAvailability = async (userId) => {
  try {
    // 매퍼에게 이 아이디가 DB에 몇 개 있는지 물어봅니다.
    const count = await infoMapper.countUserId(userId);
    // 개수가 0이면 사용 가능(true), 아니면 중복(false)입니다.
    return count === 0;
  } catch (err) {
    console.error("중복체크 서비스 에러:", err);
    throw err;
  }
};

// 4. [상세 조회] 마이페이지 등에 보여줄 내 정보를 가져옵니다.
const getUserDetail = async (userId) => {
  try {
    const user = await infoMapper.selectUserById(userId);
    if (user) {
      // 역시 보안을 위해 비밀번호는 지우고 돌려줍니다.
      const { password, ...userDetail } = user;
      return userDetail;
    }
    return null;
  } catch (err) {
    console.error("상세조회 서비스 에러:", err);
    throw err;
  }
};

// 5. [정보 수정] 내 정보를 최신으로 업데이트합니다.
const updateUser = async (data) => {
  try {
    // 1. 프론트에서 넘어온 값들을 변수에 담습니다 (매핑 작업)
    const {
      id, // Payload의 'id'
      name, // Payload of 'name'
      phone, // Payload of 'phone'
      email,
      postcode, // Payload of 'postcode'
      address,
      detailAddress, // Payload of 'detailAddress'
      newPassword,
    } = data;

    if (newPassword && newPassword.trim() !== "") {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updateParams = [
        name, // user_name
        phone, // tel
        email,
        postcode, // zip_code
        address,
        detailAddress, // detail_address
        hashedPassword,
        id, // user_id (WHERE 절)
      ];
      await infoMapper.updateUserWithPassword(updateParams);
    } else {
      const updateParams = [
        name,
        phone,
        email,
        postcode,
        address,
        detailAddress,
        id,
      ];
      await infoMapper.updateUser(updateParams);
    }

    return { status: "success" };
  } catch (err) {
    console.error("업데이트 서비스 에러:", err);
    throw err;
  }
};

// 6. [기관 목록 조회] 회원가입 시 선택할 수 있는 기관 리스트를 가져옵니다.
const getAllAgencies = async () => {
  try {
    // 매퍼에게 "창고에서 기관 정보(ID, 이름) 다 꺼내와"라고 시킵니다.
    const agencies = await infoMapper.selectAllAgencies();

    // 가져온 데이터를 반환합니다.
    // (만약 데이터가 없으면 빈 배열 []이 반환될 것입니다)
    return agencies;
  } catch (err) {
    console.error("기관 목록 조회 서비스 에러:", err);
    throw err;
  }
};

const getAgenciesByRegion = async (region) => {
  try {
    return await infoMapper.selectAgenciesByRegion(region);
  } catch (err) {
    console.error("지역별 기관 조회 서비스 에러:", err);
    throw err;
  }
};

const getAgenciesByCity = async () => {
  try {
    return await infoMapper.selectAgenciesByCity();
  } catch (err) {
    console.error("지역별 기관 조회 서비스 에러:", err);
    throw err;
  }
};

// 위 기능들을 다른 곳(Router)에서 쓸 수 있게 내보냅니다.
module.exports = {
  userSignup,
  userLogin,
  checkIdAvailability,
  getUserDetail,
  updateUser,
  getAllAgencies,
  getAgenciesByRegion,
  getAgenciesByCity,
};
