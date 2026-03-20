//전체조회
const selectAllUser = `SELECT *
                      FROM survey_version; 
                      `;

const BeneficiaryList = `
    SELECT 
      b.bene_id,
      b.bene_name,
      b.family_id, 
      u.user_name AS family_name, -- 보호자 이름
      b.gender, 
      b.birth_date, 
      b.disability_type,
      p.priority_status AS wait_step -- 우선순위 테이블의 상태를 wait_step으로 가져옴
    FROM beneficiary_info b
    LEFT JOIN user_info u ON b.family_id = u.user_id
    LEFT JOIN priority p ON b.bene_id = p.bene_id
    ORDER BY b.bene_id ASC
`;

const BeneficiaryById = `
    SELECT 
      b.*, 
      u.user_name AS family_name, 
      p.priority_status AS wait_step
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
      created_at
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
