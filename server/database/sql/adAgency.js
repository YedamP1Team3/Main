module.exports = {
  // 관리자 ID를 통해 소속된 기관 정보를 조회하는 쿼리
  getAgencyInfo: `
        SELECT 
            agency_id, agency_name, zip_code, address, detail_address,
            rep_tel, email, biz_reg_no 
        FROM agency_info 
        WHERE agency_id = (SELECT agency_id FROM user_info WHERE user_id = ?)
  `,

  // 기관 정보 업에티으 쿼리 (기관명, 대표번호, 이메일만 수정 가능)
  updateAgencyInfo: `
        UPDATE agency_info 
        SET agency_name = ?, rep_tel = ?, email = ?, detail_address = ?
        WHERE agency_id = ?
  `,
};
