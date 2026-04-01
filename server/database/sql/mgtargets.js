module.exports = {
  getMgTargetList: `
        SELECT 
            bene_id AS id,
            bene_name AS name,
            DATE_FORMAT(birth_date, '%Y-%m-%d') AS birth,
            gender,
            address,
            disability_type AS type,
            relationship AS guardian,
            zip_code AS zipCode,
            DATE_FORMAT(reg_date, '%Y-%m-%d') AS regDate
        FROM beneficiary_info
        WHERE manager_id = ?
        ORDER BY reg_date DESC
        LIMIT ? OFFSET ?
    `,

  getMgTargetCount: `
        SELECT COUNT(*) AS total 
        FROM beneficiary_info 
        WHERE manager_id = ?
    `,
};
