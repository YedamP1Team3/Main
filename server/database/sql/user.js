//전체조회
const selectAllUser = `SELECT *
                      FROM survey_version; 
                      `;
//지원자 조회
const selectBeneficiariesNames = `
    SELECT 
        bene_id, 
        bene_name 
    FROM beneficiary_info
    WHERE manager_id = ?
    ORDER BY bene_name ASC;
`;
//지원제 상세조회
const selectBeneficiariesDetail = `
SELECT 
    b.bene_id,
    b.bene_name,
    u1.user_name AS family_name, -- 기존 가족 이름
    u2.user_name AS manager_name, -- 매니저 아이디 기준 이름 추가
    b.gender,
    DATE_FORMAT(b.birth_date, '%Y-%m-%d') AS birth_date,
    b.disability_type,
    p.priority_status,
    p.priority_id,
    p.progress_status
FROM beneficiary_info b
LEFT JOIN user_info u1 ON b.family_id = u1.user_id   -- 가족 정보를 위한 조인
LEFT JOIN user_info u2 ON b.manager_id = u2.user_id  -- 매니저 정보를 위한 조인 (추가된 부분)
LEFT JOIN priority p ON b.bene_id = p.bene_id
WHERE b.bene_id = ?
`;
//지원계획서 해당아이디 조회
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
//지원계획서생성
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
//임시지원계획서생성
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
//지원자리스트 조회
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
//지원계획서 삭제
const removeSupportPlan = `
DELETE FROM support_plan WHERE plan_id=?
`;
//임시지원계획서 삭제
const removeTempPlan = `
DELETE FROM plan_draft WHERE plan_draft_id=?
`;
//지원계획서 승인요청
const resubmitSupportPlan = `
  UPDATE support_plan
  SET
    plan_objective =?,
    plan_content =?,
    progress_state ='반려/재승인',
    updated_at = NOW()
  WHERE
    plan_id =?
`;
//지원계획서 반려
const rejectSupportPlan = `
  UPDATE support_plan
  SET
    plan_objective =?,
    plan_content =?,
    progress_state ='반려/수정중',
    updated_at = NOW()
  WHERE
    plan_id =?
`;
//지원계획서업데이트(임시)
const updateTempPlan = `
  UPDATE plan_draft
  SET
    plan_objective =?,
    plan_content =?,
    updated_at = NOW()
  WHERE
    plan_draft_id =?
`;
//지원계획서 파일 추가
const insertAttachment = `
INSERT INTO attachment_file (
      plan_id, 
      plan_draft_id, 
      origin_name, 
      path, 
      file_size, 
      created_at
    ) VALUES (?, ?, ?, ?, ?, NOW())
  `;
//지원계획서 파일 조회
const selectAttachments = `
    SELECT 
        file_id,
        plan_id,
        plan_draft_id,
        origin_name, 
        path AS file_name, -- ERD상의 path 칼럼을 기존 코드의 file_name으로 매핑
        file_size,
        created_at
    FROM attachment_file
    WHERE plan_id = ?
`;
//지원계획서 파일 삭제-지원계획서 삭제할떄 우선순위로 삭제한후 지원계획서 삭제
const deleteAttachments = `
    DELETE FROM attachment_file 
    WHERE plan_id = ?
`;
//임시지원계획서 모든 파일 조회
const selectDraftAttachments = `
    SELECT 
        file_id,
        plan_id,
        plan_draft_id,
        origin_name, 
        path AS file_name,
        file_size,
        created_at
    FROM attachment_file
    WHERE plan_draft_id = ?
`;
//임시전체파일삭제
const deleteDraftAttachments = `
    DELETE FROM attachment_file 
    WHERE plan_draft_id = ?
`;
//임시파일에서 승인요청하기
const moveDraftAttachmentsToPlan = `
    UPDATE attachment_file
    SET plan_id = ?, plan_draft_id = NULL
    WHERE plan_draft_id = ?
`;
//임시파일 상세조회
const selectDraftAttachment = `
    SELECT 
        file_id,
        plan_draft_id,
        path AS file_name
    FROM attachment_file
    WHERE plan_draft_id = ? AND file_id = ?
    LIMIT 1
`;
//임시파일 한부분삭제
const deleteDraftAttachment = `
    DELETE FROM attachment_file
    WHERE plan_draft_id = ? AND file_id = ?
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
  resubmitSupportPlan,
  rejectSupportPlan,
  updateTempPlan,
  insertAttachment,
  selectAttachments,
  deleteAttachments,
  selectDraftAttachments,
  deleteDraftAttachments,
  moveDraftAttachmentsToPlan,
  selectDraftAttachment,
  deleteDraftAttachment,
};
