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
    rejection_reason, 
    manager_id, 
    created_at
) VALUES (?, ?, ?, NOW())`;

const selectRejectionHistory = `
SELECT 
    h.history_id,
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

module.exports = {
  selectSupportPlanList,
  selectSupportPlanDetail,
  approveSupportPlan,
  returnSupportPlan,
  addRejectionHistory,
  selectRejectionHistory,
  selectBeneficiariesNames,
};

