module.exports = {
  // 지원대상자 등록 쿼리
  insertDependent: `
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
};
