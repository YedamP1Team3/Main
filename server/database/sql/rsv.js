// 담당자 ID 조회
const selectManagerId = `
SELECT * 
FROM user_info 
WHERE user_id = ? 
AND role = 'MANAGER'
`;

// 담당자 스케쥴 조회
const selectManagerSchedule = `
SELECT slot_id, slot_datetime, available
FROM time_slot
WHERE manager_id = ?
ORDER BY slot_datetime
`;

module.exports = { selectManagerId, selectManagerSchedule };
