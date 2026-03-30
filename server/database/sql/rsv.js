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

// -----------------------------------reservation REST--------------------------
const insertReservation = `
  INSERT INTO reservations (
    bene_id,
    manager_id,
    start_time,
    end_time
  ) VALUES (?, ?, ?, ?)
`;

// -----------------------------------managerSchedule REST--------------------------

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

module.exports = {
  selectManagerSchedule,
  selectReservedTimes,
  selectBlockedTimes,
  insertBlockedTime,
  selectAllOccupiedTimes,
  deleteBlockedTime,
  insertReservation,
  selectActiveManagers,
  insertManagerSchedules,
  getBeneficiariesByFamilyId,
  getBeneficiaryManagerInfo,
};
