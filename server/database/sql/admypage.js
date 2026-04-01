module.exports = {
  // [중요] 아래 부분을 실제 작동하는 SQL 쿼리로 교체하세요!
  getAdminInfo: `
    SELECT 
        u.user_id, 
        u.user_name, 
        u.tel, 
        u.email, 
        u.zip_code, 
        u.address, 
        u.detail_address,
        a.agency_name
    FROM user_info u
    LEFT JOIN agency_info a ON u.agency_id = a.agency_id
    WHERE u.user_id = ?
  `,

  // 1. 비밀번호 확인용
  checkPassword: `SELECT password FROM user_info WHERE user_id = ?`,

  // 2. 기본 정보 수정
  updateAdminInfo: `
    UPDATE user_info 
    SET user_name = ?, tel = ?, email = ?, zip_code = ?, address = ?, detail_address = ?
    WHERE user_id = ?
  `,

  // 3. 비밀번호 변경
  updateAdminPassword: `UPDATE user_info SET password = ? WHERE user_id = ?`,
};
