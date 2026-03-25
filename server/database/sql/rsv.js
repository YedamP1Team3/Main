// 담당자 ID 조회
const selectManagerSchedule = `
  SELECT 
    man_schedule_id,
    manager_id,
    work_date,
    work_start_time,
    work_end_time,
    break_start_time,
    break_end_time
  FROM manager_schedules
  WHERE manager_id = ?
    AND work_date = ?
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
  insertBlockedTime,
  selectAllOccupiedTimes,
  deleteBlockedTime,
};
