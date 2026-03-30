module.exports = {
  getMgTargetList: `
        SELECT 
            b.bene_id AS id,
            b.bene_name AS name,
            DATE_FORMAT(b.birth_date, '%Y-%m-%d') AS birth,
            b.gender,
            b.address,
            b.disability_type AS type,
            b.relationship AS guardian,
            b.zip_code AS zipCode,
            DATE_FORMAT(a.created_at, '%Y-%m-%d') AS regDate
        FROM application a
        JOIN beneficiary_info b ON a.bene_id = b.bene_id
        WHERE a.user_id = ?
        ORDER BY a.created_at DESC
        LIMIT ? OFFSET ?
    `,

  getMgTargetCount: `
        SELECT COUNT(*) AS total 
        FROM application 
        WHERE user_id = ?
    `,
};
