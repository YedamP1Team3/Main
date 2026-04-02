const selectSupportResultList = `
    SELECT 
        s.result_id,         
        s.manager_id,        
        s.result_title,      
        DATE_FORMAT(s.created_at, '%Y-%m-%d') AS created_at, 
        s.progress_state,    
        s.bene_id,
        u.user_name AS manager_name
    FROM support_result s
    LEFT JOIN user_info u ON s.manager_id = u.user_id
    WHERE s.bene_id = ? 
      AND s.progress_state != '임시' 
    ORDER BY s.result_id DESC       
`;
//임시저장 리스트
const selectSupportResultTempList = `
    SELECT 
        s.result_draft_id,         
        s.manager_id,        
        s.result_title,      
        DATE_FORMAT(s.created_at, '%Y-%m-%d') AS created_at, 
        s.progress_state,    
        s.bene_id
    FROM result_draft s
    LEFT JOIN user_info u ON s.manager_id = u.user_id
    WHERE s.bene_id = ? 
      AND s.progress_state = '임시' 
    ORDER BY s.result_draft_id DESC       
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

const removeTempResult = `
DELETE FROM result_draft WHERE result_draft_id=?
`;

const removeMapping = `
DELETE FROM result_plan_mapping WHERE result_id = ?
`;

const removeTempMapping = `
DELETE FROM result_draft_mapping WHERE result_draft_id = ?
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
//임시저장업데이트
const updateTempSupportResult = `
  UPDATE result_draft
  SET
    result_title =?,
    result_content =?,
    progress_state ='임시',
    updated_at = NOW()
  WHERE
    result_draft_id =?
`;

const selectSupportResultTempDetail = `
    SELECT 
        result_draft_id AS result_id, 
        result_title,
        result_content,    
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

const selectLinkedTempList = `SELECT 
        p.plan_id,
        p.plan_objective,
        p.plan_content
    FROM result_draft_mapping m
    JOIN support_plan p ON m.plan_id = p.plan_id
    WHERE m.result_draft_id = ?
`;

// 1. 관리자가 반려할 때: 상태를 '반려/수정중'으로 변경
const rejectSupportResult = `
    UPDATE support_result 
    SET 
        progress_state = '반려/수정중', 
        rejection_reason = ?, 
        result_content = ?,
        updated_at = NOW() 
    WHERE result_id = ?
`;

// 2. 작성자가 수정한 후 다시 올릴 때: 상태를 '반려/재승인'으로 변경
const resubmitSupportResult = `
    UPDATE support_result 
    SET 
        result_title = ?, 
        result_content = ?, 
        progress_state = '반려/재승인', 
        rejection_reason = NULL, -- 재승인 시 이전 반려 사유는 비워줍니다.
        updated_at = NOW() 
    WHERE result_id = ?
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
  selectLinkedTempList,
  removeTempResult,
  removeTempMapping,
  rejectSupportResult,
  resubmitSupportResult,
};
