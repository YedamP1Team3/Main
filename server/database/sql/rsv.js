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

module.exports = { selectManagerSchedule, insertBlockedTime };
