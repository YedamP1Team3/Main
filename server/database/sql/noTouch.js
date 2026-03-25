const BeneList = `
    SELECT 
        bene_id, 
        bene_name 
    FROM beneficiary_info
    ORDER BY bene_name ASC;
`;

const BeneById = `
    SELECT 
        b.bene_id,
        b.bene_name,
        u.user_name AS family_name,
        b.gender,
        DATE_FORMAT(b.birth_date, '%Y-%m-%d') AS birth_date,
        b.disability_type,
        p.priority_status
    FROM beneficiary_info b
    LEFT JOIN user_info u ON b.family_id = u.user_id
    LEFT JOIN priority p ON b.bene_id = p.bene_id
    WHERE b.bene_id = ?
`;
const getManagers = `
        SELECT user_id, user_name 
        FROM user_info
        WHERE role = 'MANAGER'
    `;

// 담당자 배정/수정 쿼리
const updateManagerAssign = `
        UPDATE beneficiary_info 
        SET manager_id = ? 
        WHERE bene_id = ?
    `;
module.exports = {
  BeneList,
  BeneById,
  getManagers,
  updateManagerAssign,
};
