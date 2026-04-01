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
    u1.user_name AS family_name,
    u2.user_name AS manager_name,
    b.gender,
    DATE_FORMAT(b.birth_date, '%Y-%m-%d') AS birth_date,
    b.disability_type,
    p.priority_status
FROM beneficiary_info b
LEFT JOIN user_info u1 ON b.family_id = u1.user_id
LEFT JOIN user_info u2 ON b.manager_id = u2.user_id
LEFT JOIN priority p ON b.bene_id = p.bene_id
WHERE b.bene_id = ?
`;

const getManagers = `
        SELECT user_id, user_name 
        FROM user_info
        WHERE role = 'MANAGER'
    `;

const updateManagerAssign = `
        UPDATE beneficiary_info 
        SET manager_id = ? 
        WHERE bene_id = ?
    `;

const priorityLatest = `
    SELECT 
        priority_id, bene_id,
        priority_status, progress_status, 
        approval_date, rejection_reason, priority_id2
    FROM priority 
    WHERE bene_id = ? 
    ORDER BY priority_id DESC 
    LIMIT 1
  `;

const priorityInsert = `
    INSERT INTO priority 
    (bene_id, priority_status, progress_status, approval_date, rejection_reason, priority_id2) 
    VALUES (?, ?, ?, NOW(), ?, ?)
  `;

const priorityRejectHistory = `
    SELECT priority_id, priority_status, progress_status, rejection_reason, priority_id2, approval_date
    FROM priority 
    WHERE bene_id = ? AND progress_status = 'rejected'
    ORDER BY priority_id ASC
  `;

const priorityCancel = `
    DELETE FROM priority 
    WHERE bene_id = ? AND progress_status = 'pending' 
    ORDER BY priority_id DESC 
    LIMIT 1
  `;

module.exports = {
  BeneList,
  BeneById,
  getManagers,
  updateManagerAssign,
  priorityLatest,
  priorityInsert,
  priorityRejectHistory,
  priorityCancel,
};
