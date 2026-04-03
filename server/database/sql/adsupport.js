const selectSupportPlanList = `
SELECT 
    p.plan_id, 
    p.bene_id, 
    p.plan_objective, 
    p.progress_state, 
    u.user_name, 
    DATE_FORMAT(p.created_at, '%Y-%m-%d') AS created_at
FROM support_plan p
INNER JOIN user_info u ON p.manager_id = u.user_id 
WHERE p.bene_id = ? AND p.progress_state != '임시'
ORDER BY p.plan_id ASC;
`;

const selectSupportPlanDetail = `
  SELECT 
    p.plan_id,
    p.plan_objective,
    p.plan_content,
    p.progress_state,
    DATE_FORMAT(p.created_at, '%Y-%m-%d') AS created_at,
    p.manager_id,
    p.rejection_reason,
    u.user_name AS manager_name
  FROM support_plan p
  LEFT JOIN user_info u ON p.manager_id = u.user_id 
  WHERE p.plan_id = ?
`;

const approveSupportPlan = `
UPDATE support_plan
SET
  progress_state = '승인'
WHERE
  plan_id =?
`;

const returnSupportPlan = `
UPDATE support_plan
SET
  progress_state = '반려',
  updated_at = NOW()
WHERE
  plan_id =?
`;

const addRejectionHistory = `
INSERT INTO rejection_history (
    plan_id, 
    plan_objective,
    plan_content,
    rejection_reason, 
    manager_id, 
    created_at
) VALUES (?, ?, ?,?,?, NOW())`;

const selectRejectionHistory = `
SELECT 
    h.history_id,
    h.plan_objective,
    h.plan_content,
    h.rejection_reason,
    u.user_name AS manager_name,
    DATE_FORMAT(h.created_at, '%Y-%m-%d %H:%i') AS created_at
FROM rejection_history h
LEFT JOIN user_info u ON h.manager_id = u.user_id
WHERE h.plan_id = ?
ORDER BY h.created_at DESC;
`;

const selectBeneficiariesNames = `
SELECT 
    b.bene_name,
    b.bene_id
FROM beneficiary_info b
JOIN user_info u ON b.family_id = u.user_id
WHERE u.agency_id = ?
ORDER BY bene_name ASC;
`;

const selectSupportResultList = `
    SELECT 
        p.result_id,         
        p.manager_id,        
        p.result_title,      
        DATE_FORMAT(p.created_at, '%Y-%m-%d') AS created_at, 
        p.progress_state,    
        p.bene_id,
        u.user_name
    FROM support_result p
    INNER JOIN user_info u ON p.manager_id = u.user_id
    WHERE bene_id = ? 
      AND progress_state != '임시' 
    ORDER BY p.result_id DESC       
`;

const selectSupportResultDetail = `
  SELECT 
    p.result_id,
    p.result_title,
    p.result_content,
    p.progress_state,
    DATE_FORMAT(p.created_at, '%Y-%m-%d') AS created_at,
    p.manager_id,
    p.rejection_reason,
    u.user_name AS manager_name
  FROM support_result p
  LEFT JOIN user_info u ON p.manager_id = u.user_id 
  WHERE p.result_id = ?
`;

const selectAttachments = `
    SELECT 
        file_id,
        plan_id,
        plan_draft_id,
        origin_name, 
        path AS file_name,
        file_size,
        created_at
    FROM attachment_file
    WHERE plan_id = ?
`;

const selectResultAttachments = `
    SELECT
        file_id,
        result_id,
        result_draft_id,
        origin_name,
        path AS file_name,
        file_size,
        created_at
    FROM attachment_file
    WHERE result_id = ?
`;

const approveSupportResult = `
UPDATE support_result
SET
  progress_state = '승인'
WHERE
  result_id =?
`;

const completeApplicationsByApprovedResult = `
UPDATE application
SET
  app_status = '완료'
WHERE
  bene_id = (
    SELECT bene_id
    FROM support_result
    WHERE result_id = ?
  )
  AND app_status IN ('대기', '진행중', '진행 중')
`;

const resetPriorityByApprovedResult = `
INSERT INTO priority (
    bene_id,
    priority_status,
    progress_status,
    approval_date,
    rejection_reason,
    priority_id2
)
SELECT
    bene_id,
    'none',
    'none',
    NOW(),
    NULL,
    NULL
FROM support_result
WHERE result_id = ?
`;

const returnSupportResult = `
UPDATE support_result
SET
  progress_state = '반려',
  updated_at = NOW()
WHERE
  result_id =?
`;

const addResultRejectionHistory = `
INSERT INTO resultrejection_history (
    result_id, 
    result_title,
    result_content,
    rejection_reason, 
    manager_id, 
    created_at
) VALUES (?, ?, ?, ?,?,NOW())`;

const selectResultRejectionHistory = `
SELECT 
    h.history_id,
    h.result_title,
    h.result_content,
    h.rejection_reason,
    u.user_name AS manager_name,
    DATE_FORMAT(h.created_at, '%Y-%m-%d %H:%i') AS created_at
FROM resultrejection_history h
LEFT JOIN user_info u ON h.manager_id = u.user_id
WHERE h.result_id = ?
ORDER BY h.created_at DESC;
`;

const resultMappingHistory = `
   INSERT INTO result_plan_mapping_history (history_id, plan_id)
    VALUES (?, ?)
`;

const selectResultMappingHistory = `
SELECT 
        h.plan_id,
        p.plan_objective  
    FROM result_plan_mapping_history h
    JOIN support_plan p ON h.plan_id = p.plan_id
    WHERE h.history_id = ? 
`;
module.exports = {
  selectSupportPlanList,
  selectSupportPlanDetail,
  approveSupportPlan,
  returnSupportPlan,
  addRejectionHistory,
  selectRejectionHistory,
  selectBeneficiariesNames,
  selectSupportResultList,
  selectSupportResultDetail,
  approveSupportResult,
  completeApplicationsByApprovedResult,
  resetPriorityByApprovedResult,
  returnSupportResult,
  addResultRejectionHistory,
  selectResultRejectionHistory,
  resultMappingHistory,
  selectResultMappingHistory,
  selectAttachments,
  selectResultAttachments,
};
