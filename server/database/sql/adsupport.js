const AdSupportPlan = `
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

const AdDetailSupportPlan = `
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

const ApprovalChange = `
UPDATE support_plan
SET
  progress_state = '승인'
WHERE
  plan_id =?
`;

const Return = `
UPDATE support_plan
SET
  rejection_reason = ?,
  progress_state = '반려'
WHERE
  plan_id =?
`;

const AdSupportList = `
SELECT 
    b.bene_name,
    b.bene_id
FROM beneficiary_info b
JOIN user_info u ON b.family_id = u.user_id
WHERE u.agency_id = ?
ORDER BY bene_name ASC;
`;

module.exports = {
  AdSupportPlan,
  AdDetailSupportPlan,
  ApprovalChange,
  Return,
  AdSupportList,
};
