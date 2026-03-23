// 회원가입 쿼리
const insertUser = `
    INSERT INTO user_info (
        user_id, 
        agency_id, 
        password, 
        user_name, 
        role, 
        join_status, 
        zip_code, 
        address, 
        tel, 
        email, 
        created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
`;

const selectUserById = `
    SELECT * FROM user_info 
    WHERE user_id = ?
`;
module.exports = {
  insertUser,
  selectUserById,
};
