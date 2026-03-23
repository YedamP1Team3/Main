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
    WHERE bene_id = ?
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

module.exports = {
  selectAllUser,
  BeneficiaryList,
  BeneficiaryById,
  SupportPlan,
  insertSupportPlan,
};
