//전체조회
const selectAllUser = `SELECT *
                      FROM survey_version; 
                      `;

const BeneficiaryList = `
    SELECT 
      bene_id, 
      family_id, 
      gender, 
      birth_date, 
      disability_type 
    FROM beneficiary_info
    ORDER BY bene_id ASC
  `;
const BeneficiaryById = `
    SELECT * FROM beneficiary_info
    WHERE bene_id = ?
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

module.exports = {
  selectAllUser,
  BeneficiaryList,
  BeneficiaryById,
  SupportPlan,
};
