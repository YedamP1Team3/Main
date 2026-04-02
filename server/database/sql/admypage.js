module.exports = {
  // 1. [조회] 관리자의 상세 정보와 소속 기관 이름을 합쳐서 가져옵니다.
  getAdminInfo: `
    SELECT 
        u.user_id,         -- 사용자 아이디
        u.user_name,       -- 사용자 이름
        u.tel,             -- 전화번호
        u.email,           -- 이메일
        u.zip_code,        -- 우편번호
        u.address,         -- 기본 주소
        u.detail_address,  -- 상세 주소
        a.agency_name      -- (기관 테이블에서 가져온) 기관 이름
    FROM user_info u       -- 유저 정보 테이블을 'u'라는 별명으로 사용합니다.
    LEFT JOIN agency_info a ON u.agency_id = a.agency_id -- 기관 ID가 같은 데이터를 서로 연결(JOIN)합니다.
    WHERE u.user_id = ?    -- 입력받은 아이디(?)와 일치하는 사람만 골라냅니다.
  `,

  // 2. [비밀번호 확인] 로그인을 하거나 정보를 수정하기 전, DB에 저장된 암호화된 비번을 가져옵니다.
  checkPassword: `
    SELECT password 
    FROM user_info 
    WHERE user_id = ? -- 아이디가 일치하는 유저의 비밀번호 컬럼만 쏙 가져옵니다.
  `,

  // 3. [정보 수정] 이름, 연락처, 주소 등 기본 프로필 정보를 업데이트합니다.
  updateAdminInfo: `
    UPDATE user_info 
    SET 
        user_name = ?,      -- 1번째 ? : 새 이름
        tel = ?,            -- 2번째 ? : 새 전화번호
        email = ?,          -- 3번째 ? : 새 이메일
        zip_code = ?,       -- 4번째 ? : 새 우편번호
        address = ?,        -- 5번째 ? : 새 주소
        detail_address = ?  -- 6번째 ? : 새 상세주소
    WHERE user_id = ?       -- 7번째 ? : 수정한 대상의 아이디
  `,

  // 4. [비밀번호 변경] 비밀번호만 따로 안전하게 바꿀 때 사용합니다.
  updateAdminPassword: `
    UPDATE user_info 
    SET password = ? -- 새로운 (암호화된) 비밀번호로 바꿉니다.
    WHERE user_id = ? -- 대상 사용자의 아이디를 지정합니다.
  `,
};
