module.exports = {
  // 지원대상자 정보 삽입 쿼리 (reg_date는 DB 현재 시간 사용)
  insertRecipient: `
    INSERT INTO beneficiary_info
    (family_id, bene_name, disability_type, birth_date, gender, relationship, zip_code, address, reg_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
};
