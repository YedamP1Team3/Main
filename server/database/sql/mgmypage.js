// server/sql/mgmypage.js

module.exports = {
  // 1. 담당자 프로필 조회 (user_info 테이블 컬럼명 반영)
  getManagerProfile: `
        SELECT 
            user_name AS name,
            user_id AS userId,
            email AS email,
            agency_id AS institution,
            DATE_FORMAT(created_at, '%Y.%m.%d') AS joinDate,
            tel AS phone
        FROM user_info
        WHERE user_id = ? AND role = 'MANAGER'
    `,

  // 2. 업무 현황 통계 (각 테이블의 실제 컬럼명 반영)
  getTaskStats: `
        SELECT '지원서' AS title, '접수' AS label, COUNT(*) AS value 
        FROM application 
        WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        
        UNION ALL
        
        SELECT '상담일지' AS title, '상담완료' AS label, COUNT(*) AS value 
        FROM reservations 
        WHERE manager_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)

        UNION ALL

        SELECT '지원계획서' AS title, progress_state AS label, COUNT(*) AS value 
        FROM support_plan 
        WHERE manager_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY progress_state

        UNION ALL

        SELECT '지원결과서' AS title, progress_state AS label, COUNT(*) AS value 
        FROM support_result 
        WHERE manager_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY progress_state
    `,
};
