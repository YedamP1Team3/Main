module.exports = {
  // 지원대상자 정보 삽입 쿼리 (reg_date는 DB 현재 시간 사용)
  insertRecipient: `
    INSERT INTO beneficiary_info
    (family_id, bene_name, disability_type, birth_date, gender, relationship, zip_code, address, reg_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,

  // 보호자 ID(family_id)에 해당하는 모든 대상자 정보를 가져옴
  selectRecipientList: `
    SELECT * FROM beneficiary_info
    WHERE family_id = ?
    ORDER BY reg_date DESC
    `,

  // 대상자 1명의 정보를 가져오는 쿼리문
  selectRecipientById: `
    SELECT * FROM beneficiary_info
    WHERE bene_id = ?
    `,

  // 대상자 정보를 수정하는 쿼리문
  updateRecipient: `
    UPDATE beneficiary_info
    SET bene_name = ?, disability_type = ?, birth_date = ?, gender = ?, 
        relationship = ?, zip_code = ?, address = ?
    WHERE bene_id = ?
    `,
};
