const BeneList = `
    SELECT 
        bene_id, 
        bene_name 
    FROM beneficiary_info
    ORDER BY bene_name ASC;
`;

const BeneById = `
SELECT 
    b.bene_id,
    b.bene_name,
    u1.user_name AS family_name, -- 기존 가족 이름
    u2.user_name AS manager_name, -- 매니저 아이디 기준 이름 추가
    b.gender,
    DATE_FORMAT(b.birth_date, '%Y-%m-%d') AS birth_date,
    b.disability_type,
    p.priority_status
FROM beneficiary_info b
LEFT JOIN user_info u1 ON b.family_id = u1.user_id   -- 가족 정보를 위한 조인
LEFT JOIN user_info u2 ON b.manager_id = u2.user_id  -- 매니저 정보를 위한 조인 (추가된 부분)
LEFT JOIN priority p ON b.bene_id = p.bene_id
WHERE b.bene_id = ?
`;
const getManagers = `
        SELECT user_id, user_name 
        FROM user_info
        WHERE role = 'MANAGER'
    `;

// 담당자 배정/수정 쿼리
const updateManagerAssign = `
        UPDATE beneficiary_info 
        SET manager_id = ? 
        WHERE bene_id = ?
    `;
// [추가 1] 대기단계 최신 상태 조회 (매니저 화면용)
// 매니저 화면(ManagerPriorityStage.vue, ManagerPriorityResult.vue)에서 현재 상태를 렌더링할 때 사용합니다.
const priorityLatest = `
    SELECT 
        priority_id, bene_id,
        priority_status, progress_status, 
        approval_date, rejection_reason, priority_id2
    FROM priority 
    WHERE bene_id = ? 
    ORDER BY priority_id DESC 
    LIMIT 1
  `;

// [추가 2] 대기단계 이력 추가 (신청 / 승인 / 반려 공통)
// 어떤 액션이든 이 쿼리로 새로운 ROW를 쌓습니다.
const priorityInsert = `
    INSERT INTO priority 
    (bene_id, priority_status, progress_status, approval_date, rejection_reason, priority_id2) 
    VALUES (?, ?, ?, NOW(), ?, ?)
  `;

// [추가 3] 특정 대상자의 전체 반려 이력 조회 (관리자 화면용)
const priorityRejectHistory = `
    SELECT priority_id, priority_status, progress_status, rejection_reason, priority_id2, approval_date
    FROM priority 
    WHERE bene_id = ? AND progress_status = 'rejected'
    ORDER BY priority_id ASC
  `;

// [추가 4] 대기단계 신청 취소 (가장 최근의 pending 상태 1건만 삭제)
// 이렇게 하면 과거의 반려 이력 등은 안전하게 보존됩니다.
const priorityCancel = `
    DELETE FROM priority 
    WHERE bene_id = ? AND progress_status = 'pending' 
    ORDER BY priority_id DESC 
    LIMIT 1
  `;

module.exports = {
  BeneList,
  BeneById,
  getManagers,
  updateManagerAssign,
  priorityLatest,
  priorityInsert,
  priorityRejectHistory,
  priorityCancel,
};
