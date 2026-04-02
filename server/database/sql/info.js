// 1. [회원가입] 새로운 회원 정보를 DB 창고에 처음으로 저장하는 쿼리입니다.
const insertUser = `
    INSERT INTO user_info (
        user_id,        -- 사용자 아이디
        agency_id,      -- 소속 기관 아이디
        password,       -- 비밀번호 (암호화된 상태)
        user_name,      -- 이름
        role,           -- 권한 (예: 가족, 일반 등)
        join_status,    -- 가입 상태 (예: 승인대기, 승인 등)
        zip_code,       -- 우편번호
        address,        -- 주소
        detail_address, -- 상세주소
        tel,            -- 전화번호
        email,          -- 이메일
        created_at      -- 가입 일시 (NOW() 함수를 써서 현재 시간을 자동 입력)
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()) -- ? 자리에 실제 데이터들이 순서대로 들어갑니다.
`;

// 2. [조회] 특정 아이디를 가진 회원의 모든 정보를 찾아오는 쿼리입니다.
const selectUserById = `
    SELECT * FROM user_info 
    WHERE user_id = ? -- ? 자리에 찾고 싶은 아이디를 넣어서 검색합니다.
`;

// 3. [정보 수정] 이미 가입된 회원의 정보를 새로운 내용으로 덮어쓰는 쿼리입니다.
const updateUser = `
    UPDATE user_info SET 
        user_name = ?,   -- 새 이름으로 변경
        tel = ?,         -- 새 전화번호로 변경
        email = ?,       -- 새 이메일로 변경
        zip_code = ?,    -- 새 우편번호로 변경
        address = ?,     -- 새 주소로 변경
        detail_address = ? -- 새 상세주소로 변경
    WHERE user_id = ?    -- [주의!] 이 아이디를 가진 사람의 정보만 바꾸겠다는 뜻입니다.
`;

const selectAgenciesByRegion = `
    SELECT 
            agency_id AS id, 
            agency_name AS agency_name 
        FROM agency_info
        WHERE region = ?
        ORDER BY agency_name ASC
`;

const selectAgenciesByCity = `
SELECT DISTINCT region AS label, region AS value 
FROM agency_info
ORDER BY region ASC;
`;

// 이 쿼리들을 다른 파일(Mapper)에서 가져다 쓸 수 있도록 내보냅니다.
module.exports = {
  insertUser,
  selectUserById,
  updateUser,
  selectAgenciesByRegion,
  selectAgenciesByCity,
};
