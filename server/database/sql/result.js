const resultList = `
SELECT 
    MAX(result_id) AS result_id,        
    bene_id,
    result_title,                      
    progress_state,
    manager_id,
    DATE_FORMAT(MAX(created_at), '%Y-%m-%d') AS created_at, 
    result_group_id                     
FROM support_result
WHERE bene_id = ? 
  AND progress_state != '임시'
GROUP BY result_group_id                
ORDER BY result_id DESC;               
`;

const saveResultList = `
SELECT 
    MAX(result_id) AS result_id,        
    bene_id,
    result_title,                      
    progress_state,
    manager_id,
    DATE_FORMAT(MAX(created_at), '%Y-%m-%d') AS created_at, 
    result_group_id                     
FROM support_result
WHERE bene_id = ? 
  AND progress_state = '임시'
GROUP BY result_group_id                
ORDER BY result_id DESC;               
`;

const newResult = `
INSERT INTO support_result (
    plan_id,
    manager_id,
    bene_id,
    result_title,
    result_content,
    progress_state,
    result_group_id,
    created_at
) VALUES (?,?,?,?,?,?,?, CURDATE())
`;

const supportList = `
  SELECT
    plan_id,
    plan_objective
  FROM support_plan
  WHERE bene_id = ? AND progress_state = '승인'
  ORDER BY bene_id ASC;
`;

module.exports = {
  resultList,
  saveResultList,
  newResult,
  supportList,
};
