//전체조회
const selectAllUser = `SELECT *
                      FROM survey_version; 
                      `;

const BeneficiaryList = `
    SELECT 
        bene_id, 
        bene_name 
    FROM beneficiary_info 
    ORDER BY bene_name ASC
`;

const BeneficiaryById = `
    SELECT 
        b.bene_id,
        b.bene_name,
        u.user_name AS family_name,
        b.gender,
        DATE_FORMAT(b.birth_date, '%Y-%m-%d') AS birth_date,
        b.disability_type,
        p.priority_status
    FROM beneficiary_info b
    LEFT JOIN user_info u ON b.family_id = u.user_id
    LEFT JOIN priority p ON b.bene_id = p.bene_id
    WHERE b.bene_id = ?
`;

const SupportPlan = `
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
const insertSupportPlan = `
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
const provisionalPlan = `
        SELECT 
      plan_id, 
      bene_id, 
      plan_objective, 
      progress_state, 
      manager_id,
      DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at
    FROM support_plan
    WHERE bene_id = ? AND progress_state = '임시'
    ORDER BY plan_id ASC
 `;

const DetailSupportPlan = `
  SELECT
    plan_id,
    plan_objective,
    plan_content,
    progress_state,
    DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at,
    manager_id
  FROM support_plan
  WHERE plan_id =?
`;

const deleteSupportPlan = `
DELETE FROM support_plan WHERE plan_id=?AND progress_state = '임시'
`;

const UpdateSupportPlan = `
  UPDATE support_plan
  SET
    plan_objective =?,
    plan_content =?,
    progress_state ='승인',
    updated_at = NOW()
  WHERE
    plan_id =? AND progress_state ='임시' 
`;

module.exports = {
  selectAllUser,
  BeneficiaryList,
  BeneficiaryById,
  SupportPlan,
  insertSupportPlan,
  provisionalPlan,
  DetailSupportPlan,
  deleteSupportPlan,
  UpdateSupportPlan,
};
