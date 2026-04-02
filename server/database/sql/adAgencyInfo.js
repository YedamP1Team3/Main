// const getCenterInfo = `
//     SELECT
//       a.agency_id as agency_id,
//       a.agency_name as agency_name,
//       a.zip_code as zip_code,
//       a.address as address,
//       a.detail_address as detail_address,
//       a.rep_tel as rep_tel,
//       a.email as email,
//       a.biz_reg_no as biz_reg_no
//     FROM agency_info a
//     JOIN user_info u ON a.agency_id = u.agency_id
//     WHERE u.user_id = ?;
// `;

// const updateCenterInfo = `
//     UPDATE agency_info
//     SET
//       agency_name = ?,
//       rep_tel = ?,
//       email = ?,
//       address = ?,
//       zip_code = ?,
//       detail_address = ?
//     WHERE agency_id = ?;
// `;

// module.exports = {
//   getCenterInfo,
//   updateCenterInfo,
// };
