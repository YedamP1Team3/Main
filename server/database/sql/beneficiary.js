const beneficiarySql = {
  // 지원대상자 등록 쿼리
  insertBeneficiary: `
        INSERT INTO BENEFICIARY_INFO (
            FAMILY_ID, 
            MANAGER_ID, 
            BENE_NAME, 
            DISABILITY_TYPE, 
            BIRTH_DATE, 
            GENDER, 
            RELATIONSHIP, 
            ZIP_CODE, 
            ADDRESS, 
            REG_DATE
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,

  // 특정 보호자(FAMILY_ID)에 속한 대상자 목록 조회 (나중에 필요할 거예요)
  selectBeneficiariesByFamily: `
        SELECT * FROM BENEFICIARY_INFO WHERE FAMILY_ID = ?
    `,
};

module.exports = beneficiarySql;
