const selecthistory = `
    SELECT 
        user_id AS userId,
        user_name AS userName,
        tel AS phone,
        email AS email,
        DATE_FORMAT(created_at, '%Y.%m.%d') AS joinDate,
        join_status AS status
    FROM user_info
    WHERE role = 'FAMILY'
    ORDER BY created_at DESC;
`;

const updatehistory = `
    UPDATE user_info 
    SET join_status = ? 
    WHERE user_id = ?;
`;

const deletehistory = `
    DELETE FROM user_info 
    WHERE user_id = ?;
`;

module.exports = {
  selecthistory,
  updatehistory,
  deletehistory,
};
