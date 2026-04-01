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
        detail_address,
        tel, 
        email, 
        created_at
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
`;

const selectUserById = `
    SELECT * FROM user_info 
    WHERE user_id = ?
`;

// 정보 수정을 위한 업데이트 쿼리
const updateUser = `
    UPDATE user_info SET 
        user_name = ?, tel = ?, email = ?, 
        zip_code = ?, address = ?, detail_address = ?
    WHERE user_id = ?
`;

module.exports = {
  insertUser,
  selectUserById,
  updateUser,
};
