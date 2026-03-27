const resultList = `
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

const saveResultList = `
    SELECT 
        result_id,         
        manager_id,        
        result_title,      
        DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at, 
        progress_state,    
        bene_id
    FROM support_result
    WHERE bene_id = ? 
      AND progress_state = '임시' 
    ORDER BY result_id DESC       
`;

const newResult = `
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

const listMapping = `
    INSERT INTO result_plan_mapping (
    result_id, plan_id
    ) VALUES (?,?)
`;

const supportList = `
  SELECT
    plan_id,
    plan_objective
  FROM support_plan
  WHERE bene_id = ? AND progress_state = '승인'
  ORDER BY bene_id ASC;
`;

const detailResultPlan = `
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
const plusPlanList = `
    select 
        p.plan_id,
        p.plan_objective,
        p.plan_content
    from result_plan_mapping m
    join support_plan p on m.plan_id = p.plan_id
    where m.result_id = ?
`;

const supportResult = `
DELETE FROM support_result WHERE result_id=?
`;

const deleteMapping = `
DELETE FROM result_plan_mapping WHERE result_id = ?
`;

const updateResultPlan = `
  UPDATE support_result
  SET
    result_title =?,
    result_content =?,
    progress_state ='대기',
    updated_at = NOW()
  WHERE
    result_id =?
`;

const updateSavePlan = `
  UPDATE support_result
  SET
    result_title =?,
    result_content =?,
    progress_state ='임시',
    updated_at = NOW()
  WHERE
    result_id =?
`;

module.exports = {
  resultList,
  saveResultList,
  newResult,
  supportList,
  listMapping,
  detailResultPlan,
  plusPlanList,
  supportResult,
  deleteMapping,
  updateResultPlan,
  updateSavePlan,
};
