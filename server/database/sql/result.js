const selectSupportResultList = `
    SELECT 
        result_id,         
        manager_id,        
        result_title,      
        DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at, 
        progress_state,    
        bene_id
    FROM support_result
    WHERE bene_id = ? 
      AND progress_state != '임시' 
    ORDER BY result_id DESC       
`;
//임시저장 리스트
const selectSupportResultTempList = `
    SELECT 
        result_draft_id,         
        manager_id,        
        result_title,      
        DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at, 
        progress_state,    
        bene_id
    FROM result_draft
    WHERE bene_id = ? 
      AND progress_state = '임시' 
    ORDER BY result_draft_id DESC       
`;

const createSupportResult = `
INSERT INTO support_result (
    plan_id,
    manager_id,
    bene_id,
    result_title,
    result_content,
    progress_state,
    created_at
) VALUES (?,?,?,?,?,?, CURDATE())
`;

const createTempResult = `
    INSERT INTO result_draft (
        plan_id, manager_id, bene_id, result_title, result_content, progress_state, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, NOW())
`;

const selectApprovedPlanList = `
  SELECT
    plan_id,
    plan_objective
  FROM support_plan
  WHERE bene_id = ? AND progress_state = '승인'
  ORDER BY bene_id ASC;
`;

const selectSupportResultDetail = `
    select 
        result_id,
        result_title,
        result_content,
        progress_state,
        date_format(created_at, '%Y-%m-%d') as created_at,
        manager_id,
        rejection_reason
    from support_result
    where result_id = ?
`;
const selectLinkedPlanList = `
    select 
        p.plan_id,
        p.plan_objective,
        p.plan_content
    from result_plan_mapping m
    join support_plan p on m.plan_id = p.plan_id
    where m.result_id = ?
`;

const removeSupportResult = `
DELETE FROM support_result WHERE result_id=?
`;

const removeMapping = `
DELETE FROM result_plan_mapping WHERE result_id = ?
`;

const applySupportResult = `
  UPDATE support_result
  SET
    result_title =?,
    result_content =?,
    progress_state ='대기',
    updated_at = NOW()
  WHERE
    result_id =?
`;

const updateTempSupportResult = `
  UPDATE support_result
  SET
    result_title =?,
    result_content =?,
    progress_state ='임시',
    updated_at = NOW()
  WHERE
    result_id =?
`;

const selectSupportResultTempDetail = `
    SELECT 
        result_draft_id AS result_id, 
        result_title,
        result_content,
        selected_plan_ids,  
        progress_state,
        DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at,
        manager_id,
        bene_id
    FROM result_draft
    WHERE result_draft_id = ?
`;

const selectTempMappingPlans = `
    SELECT plan_id FROM result_draft_mapping WHERE result_draft_id = ?
`;

const insertMapping = `
    INSERT INTO result_plan_mapping (
    result_id, plan_id
    ) VALUES (?,?)
`;

const insertTempMapping = `
    INSERT INTO result_draft_mapping (result_draft_id, plan_id) 
    VALUES (?, ?)
`;

module.exports = {
  selectSupportResultList,
  selectSupportResultTempList,
  createSupportResult,
  createTempResult,
  insertMapping,
  selectApprovedPlanList,
  selectSupportResultDetail,
  selectLinkedPlanList,
  removeSupportResult,
  removeMapping,
  applySupportResult,
  updateTempSupportResult,
  selectSupportResultTempDetail,
  selectTempMappingPlans,
  insertTempMapping,
};
