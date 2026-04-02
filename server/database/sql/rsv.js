const getBeneficiaryManagerInfo = `
  SELECT
    bene_id,
    family_id,
    manager_id
  FROM beneficiary_info
  WHERE bene_id = ?
`;

const getBeneficiariesByFamilyId = `SELECT 
    bene_id,
    manager_id,
    bene_name,
    relationship,
    disability_type,
    birth_date,
    gender
FROM beneficiary_info
WHERE family_id = ?
ORDER BY bene_name`;

// -----------------------------------reservation API--------------------------
const insertReservation = `
  INSERT INTO reservations (
    bene_id,
    manager_id,
    start_time,
    end_time
  ) VALUES (?, ?, ?, ?)
`;

const selectFamilyReservations = `
  SELECT
    r.rsv_id,
    r.bene_id,
    b.bene_name,
    b.disability_type,
    DATE_FORMAT(r.start_time, '%Y-%m-%d %H:%i:%s') AS start_time,
    DATE_FORMAT(r.end_time, '%Y-%m-%d %H:%i:%s') AS end_time,
    r.rsv_status
  FROM reservations r
  INNER JOIN beneficiary_info b
    ON r.bene_id = b.bene_id
  WHERE b.family_id = ?
  ORDER BY r.start_time DESC
`;

const deleteReservation = `
  DELETE FROM reservations
  WHERE rsv_id = ?
`;

// -----------------------------------managerSchedule API--------------------------

// ACTIVE 상태의 MANAGER 전체 조회
const selectActiveManagers = `
  SELECT user_id
  FROM user_info
  WHERE role = 'MANAGER'
  AND join_status = 'ACTIVE'
`;

// 다음 달 스케줄 bulk insert
// UNIQUE(manager_id, work_date) 존재 전제
const insertManagerSchedules = `
  INSERT IGNORE INTO manager_schedules
  (manager_id, work_date, work_start_time, work_end_time)
  VALUES (?, ?, ?, ?)
`;

// 담당자 일정 조회
const selectManagerSchedule = `
  SELECT 
    man_schedule_id,
    manager_id,
    work_date,
    work_start_time,
    work_end_time
  FROM manager_schedules
  WHERE manager_id = ?
    AND work_date = ?
`;

const selectReservedTimes = `
  SELECT
    DATE_FORMAT(start_time, '%Y-%m-%d %H:%i:%s') AS start_time,
    DATE_FORMAT(end_time, '%Y-%m-%d %H:%i:%s') AS end_time
  FROM reservations
  WHERE manager_id = ?
    AND DATE(start_time) = ?
    AND rsv_status IN ('REQUESTED', 'APPROVED')
  ORDER BY start_time
`;

const selectBlockedTimes = `
  SELECT
    CONCAT(work_date, ' ', start_time) AS start_time,
    CONCAT(work_date, ' ', end_time) AS end_time
  FROM manager_blocked_times
  WHERE manager_id = ?
    AND work_date = ?
  ORDER BY start_time
`;

const insertBlockedTime = `
  INSERT INTO manager_blocked_times (
    manager_id,
    work_date,
    start_time,
    end_time
  )
  VALUES (?, ?, ?, ?)
`;

const selectAllOccupiedTimes = `
      SELECT start_time, end_time
      FROM reservations
      WHERE manager_id = ?
        AND DATE(start_time) = ?
        AND rsv_status IN ('REQUESTED', 'APPROVED')

      UNION ALL

      SELECT 
        CONCAT(work_date, ' ', start_time) AS start_time,
        CONCAT(work_date, ' ', end_time) AS end_time
      FROM manager_blocked_times
      WHERE manager_id = ?
        AND work_date = ?
      `;

const deleteBlockedTime = `
      DELETE FROM manager_blocked_times
      WHERE manager_id = ?
        AND work_date = ?
        AND NOT (
          end_time <= ? OR start_time >= ?
        )
    `;

// -----------------------------------manageReservation API--------------------------

const selectManagerReservations = `
SELECT
    r.rsv_id,
    u.user_name AS family_name,
    b.bene_name,
    b.disability_type,
    DATE_FORMAT(r.start_time, '%Y-%m-%d %H:%i:%s') AS start_time,
    DATE_FORMAT(r.end_time, '%Y-%m-%d %H:%i:%s') AS end_time,
    r.rsv_status
FROM reservations r
JOIN beneficiary_info b
    ON r.bene_id = b.bene_id
JOIN user_info u
    ON b.family_id = u.user_id
WHERE r.manager_id = ?
ORDER BY r.start_time DESC
`;

const updateReservationStatus = `
UPDATE reservations
SET rsv_status = ?
WHERE rsv_id = ?
  AND rsv_status = 'REQUESTED'
`;

// -----------------------------------counseling API--------------------------

const selectManagerCounselList = `
SELECT
    r.rsv_id,
    u.user_name AS family_name,
    b.bene_name,
    b.disability_type,
    DATE_FORMAT(r.start_time, '%Y-%m-%d %H:%i:%s') AS start_time,
    DATE_FORMAT(r.end_time, '%Y-%m-%d %H:%i:%s') AS end_time,
    r.rsv_status
FROM reservations r
JOIN beneficiary_info b
    ON r.bene_id = b.bene_id
JOIN user_info u
    ON b.family_id = u.user_id
WHERE r.manager_id = ?
  AND r.rsv_status IN ('COMPLETED', 'NOTE_WRITTEN')
ORDER BY r.start_time DESC
`;

const selectCounselReservationByRsvId = `
SELECT
    r.rsv_id,
    u.user_name AS family_name,
    b.bene_name,
    b.disability_type,
    DATE_FORMAT(r.start_time, '%Y-%m-%d %H:%i:%s') AS start_time,
    DATE_FORMAT(r.end_time, '%Y-%m-%d %H:%i:%s') AS end_time,
    r.rsv_status
FROM reservations r
JOIN beneficiary_info b
    ON r.bene_id = b.bene_id
JOIN user_info u
    ON b.family_id = u.user_id
WHERE r.rsv_id = ?
`;

const insertCounselingNote = `
INSERT INTO counseling_note (
    rsv_id,
    counseling_type,
    title,
    content,
    future_plan,
    created_at,
    updated_at
) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
`;

const updateReservationStatusToNoteWritten = `
UPDATE reservations
SET rsv_status = 'NOTE_WRITTEN'
WHERE rsv_id = ?
`;

module.exports = {
  selectManagerSchedule,
  selectReservedTimes,
  selectBlockedTimes,
  insertBlockedTime,
  selectAllOccupiedTimes,
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
  selectManagerCounselList,
  selectCounselReservationByRsvId,
  insertCounselingNote,
  updateReservationStatusToNoteWritten,
};
