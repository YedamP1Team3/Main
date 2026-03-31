//전체조회
const selectAllUser = `SELECT *
                      FROM survey_version; 
                      `;

const selectBeneficiariesNames = `
    SELECT 
        bene_id, 
        bene_name 
    FROM beneficiary_info
    WHERE manager_id = ?
    ORDER BY bene_name ASC;
`;

const selectBeneficiariesDetail = `
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

const selectSupportPlanList = `
    SELECT 
      plan_id, 
      bene_id, 
      plan_objective, 
      progress_state, 
      manager_id,
      DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at
    FROM support_plan
    WHERE bene_id = ? AND progress_state != '임시'
    ORDER BY plan_id ASC
`;
const createSupportPlan = `
    INSERT INTO support_plan (
      priority_id,       
      manager_id,        
      bene_id,          
      plan_objective,    
      plan_content,      
      progress_state,    
      created_at         
    ) VALUES (?, ?, ?, ?, ?, ?, CURDATE())
`;

const createTempPlan = `
    INSERT INTO plan_draft (
      plan_draft_id,
      manager_id,
      bene_id,
      plan_objective,
      plan_content,
      progress_state,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, CURDATE())
`;
//임시지원계획리스트 조회
const selectSupportPlanTempList = `
        SELECT 
      plan_draft_id, 
      bene_id, 
      plan_objective, 
      progress_state, 
      manager_id,
      DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at
    FROM plan_draft
    WHERE bene_id = ? 
    ORDER BY plan_draft_id ASC
 `;

const selectSupportPlanDetail = `
  SELECT
    plan_id,
    plan_objective,
    plan_content,
    progress_state,
    DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at,
    manager_id,
    rejection_reason
  FROM support_plan
  WHERE plan_id =?
`;
//임시지원계획서상세조회
const selectTempPlanDetail = `
  SELECT
    plan_draft_id,
    plan_objective,
    plan_content,
    progress_state,
    DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at,
    manager_id
  FROM plan_draft
  WHERE plan_draft_id =?
`;

const removeSupportPlan = `
DELETE FROM support_plan WHERE plan_id=?
`;

const removeTempPlan = `
DELETE FROM plan_draft WHERE plan_draft_id=?
`;

const applySupportPlan = `
  UPDATE support_plan
  SET
    plan_objective =?,
    plan_content =?,
    progress_state ='대기',
    updated_at = NOW()
  WHERE
    plan_id =?
`;

const updateTempPlan = `
  UPDATE plan_draft
  SET
    plan_objective =?,
    plan_content =?,
    updated_at = NOW()
  WHERE
    plan_draft_id =?
`;

module.exports = {
  selectAllUser,
  selectBeneficiariesNames,
  selectBeneficiariesDetail,
  selectSupportPlanList,
  createSupportPlan,
  createTempPlan,
  selectSupportPlanTempList,
  selectSupportPlanDetail,
  selectTempPlanDetail,
  removeSupportPlan,
  removeTempPlan,
  applySupportPlan,
  updateTempPlan,
};
