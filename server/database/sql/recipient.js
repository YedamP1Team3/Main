module.exports = {
  // 1. [등록] 새로운 지원 대상자(어르신, 아동 등)의 정보를 한 줄 추가합니다.
  insertRecipient: `
    INSERT INTO beneficiary_info -- 대상자 정보 테이블에 넣겠습니다.
    (
      family_id,       -- 이 대상자를 등록한 보호자(나)의 ID
      bene_name,       -- 대상자 성함
      disability_type, -- 장애 유형
      birth_date,      -- 생년월일
      gender,          -- 성별 (M/F)
      relationship,    -- 보호자와의 관계
      zip_code,        -- 우편번호
      address,         -- 주소
      reg_date         -- 등록 일시
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW()) -- NOW()는 '지금 이 순간' 시간을 자동으로 넣으라는 뜻입니다.
    `,

  // 2. [목록 조회] 내가 등록한 모든 대상자를 최신순으로 가져옵니다.
  selectRecipientList: `
    SELECT * FROM beneficiary_info
    WHERE family_id = ? -- '나(family_id)'와 연결된 대상자만 골라냅니다.
    ORDER BY reg_date DESC -- 가장 최근에 등록한 사람이 위로 오게 정렬합니다.
    `,

  // 3. [상세 조회] 특정 대상자 1명의 정보만 쏙 뽑아옵니다.
  selectRecipientById: `
    SELECT * FROM beneficiary_info
    WHERE bene_id = ? -- 대상자 고유 번호(bene_id)를 통해 정확히 그 사람만 찾습니다.
    `,

  // 4. [정보 수정] 이미 등록된 대상자의 정보를 바뀐 내용으로 업데이트합니다.
  updateRecipient: `
    UPDATE beneficiary_info
    SET 
        bene_name = ?,       -- 바뀐 이름 적용
        disability_type = ?, -- 바뀐 장애 유형 적용
        birth_date = ?,      -- 바뀐 생년월일 적용
        gender = ?,          -- 바뀐 성별 적용
        relationship = ?,    -- 바뀐 관계 적용
        zip_code = ?,        -- 바뀐 우편번호 적용
        address = ?          -- 바뀐 주소 적용
    WHERE bene_id = ?        -- [주의] 이 번호를 가진 대상자의 정보만 수정합니다.
    `,
};
