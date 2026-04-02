const { pool } = require("../DAO.js");
const rsvSql = require("../sql/rsv.js");

const getBeneficiaryManagerInfo = async (beneId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(rsvSql.getBeneficiaryManagerInfo, [beneId]);
    return rows;
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const getBeneficiariesByFamilyId = async (familyId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(rsvSql.getBeneficiariesByFamilyId, [
      familyId,
    ]);
    return rows;
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
// -----------------------------------reservation API--------------------------
const insertReservation = async (beneId, managerId, startTime, endTime) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(rsvSql.insertReservation, [
      beneId,
      managerId,
      startTime,
      endTime,
    ]);
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const selectFamilyReservations = async (userId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(rsvSql.selectFamilyReservations, [userId]);
    console.log("FamilyRsvInfo : ", rows);
    return rows;
  } catch (err) {
    console.error("selectFamilyReservations mapper 에러:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const deleteReservation = async (rsvId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(rsvSql.deleteReservation, [rsvId]);
    return result;
  } catch (err) {
    console.error("deleteReservation mapper 에러:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// -----------------------------------managerSchedule API--------------------------

// ACTIVE MANAGER 목록 조회
const selectActiveManagers = async () => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(rsvSql.selectActiveManagers);
    return rows;
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 스케줄 bulk insert
const insertManagerSchedules = async (values) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const result = await conn.batch(rsvSql.insertManagerSchedules, values);
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const selectManagerSchedule = async (managerId, date) => {
  let conn = null;
  try {
    conn = await pool.getConnection();

    let rows = await conn.query(rsvSql.selectManagerSchedule, [
      managerId,
      date,
    ]);

    // 단건 조회니까 첫 번째 데이터만 반환
    return rows[0];
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const selectReservedTimes = async (managerId, date) => {
  let conn = null;
  try {
    conn = await pool.getConnection();

    const rows = await conn.query(rsvSql.selectReservedTimes, [
      managerId,
      date,
    ]);

    return rows;
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const selectBlockedTimes = async (managerId, date) => {
  let conn = null;
  try {
    conn = await pool.getConnection();

    const rows = await conn.query(rsvSql.selectBlockedTimes, [managerId, date]);

    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const insertBlockedTime = async (managerId, date, startTime, endTime) => {
  let conn = null;
  try {
    conn = await pool.getConnection();

    await conn.query(rsvSql.insertBlockedTime, [
      managerId,
      date,
      startTime,
      endTime,
    ]);
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const deleteBlockedTime = async (managerId, date, startTime, endTime) => {
  let conn = null;
  try {
    conn = await pool.getConnection();

    const result = await conn.query(rsvSql.deleteBlockedTime, [
      managerId,
      date,
      startTime,
      endTime,
    ]);
    return result.affectedRows; // 삭제된 row 수 반환
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const selectManagerReservations = async (managerId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(rsvSql.selectManagerReservations, [
      managerId,
    ]);
    return rows;
  } catch (err) {
    console.error("selectManagerReservations error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const updateReservationStatus = async (rsvId, status) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(rsvSql.updateReservationStatus, [
      status,
      rsvId,
    ]);
    return result;
  } catch (err) {
    console.error("updateReservationStatus error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// -----------------------------------counseling API--------------------------

const insertCounselingNote = async (noteData) => {
  let conn = null;
  try {
    conn = await pool.getConnection();

    const { rsvId, counselingType, title, content, futurePlan } = noteData;

    const result = await conn.query(rsvSql.insertCounselingNote, [
      rsvId,
      counselingType,
      title,
      content,
      futurePlan,
    ]);

    return result;
  } catch (err) {
    console.error("insertCounselingNote error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const updateReservationStatusToNoteWritten = async (rsvId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();

    const result = await conn.query(
      rsvSql.updateReservationStatusToNoteWritten,
      [rsvId],
    );

    return result;
  } catch (err) {
    console.error("updateReservationStatusToNoteWritten error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  selectManagerSchedule,
  selectReservedTimes,
  selectBlockedTimes,
  insertBlockedTime,
  deleteBlockedTime,
  insertReservation,
  selectFamilyReservations,
  deleteReservation,
  selectActiveManagers,
  insertManagerSchedules,
  getBeneficiariesByFamilyId,
  getBeneficiaryManagerInfo,
  selectManagerReservations,
  updateReservationStatus,
  insertCounselingNote,
  updateReservationStatusToNoteWritten,
};
