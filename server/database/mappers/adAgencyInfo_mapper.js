// const { pool } = require("../DAO.js");
// const adagencysql = require("../sql/adAgencyInfo.js");

// const adagencyinfo_mapper = {
//   getCenterInfo: async (userId) => {
//     let conn;
//     try {
//       conn = await pool.getConnection();
//       const [rows] = await conn.query(adagencysql.getCenterInfo, [userId]);
//       return rows[0];
//     } catch (err) {
//       console.error("Mapper 조회 에러:", err);
//       throw err;
//     } finally {
//       if (conn) conn.release();
//     }
//   },

//   updateCenterInfo: async (agencyData) => {
//     let conn;
//     try {
//       conn = await pool.getConnection();
//       const {
//         agency_name,
//         rep_tel,
//         email,
//         address,
//         zip_code,
//         detail_address,
//         agency_id,
//       } = agencyData;

//       const [result] = await conn.query(adagencysql.updateCenterInfo, [
//         agency_name,
//         rep_tel,
//         email,
//         address,
//         zip_code,
//         detail_address,
//         agency_id,
//       ]);

//       return result.affectedRows > 0;
//     } catch (err) {
//       console.error("Mapper 수정 에러:", err);
//       throw err;
//     } finally {
//       if (conn) conn.release();
//     }
//   },
// };

// module.exports = adagencyinfo_mapper;
