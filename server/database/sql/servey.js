// 기존 selectSurvey 쿼리 수정: WHERE v.IS_ACTIVE = 1 을 삭제하고 VERSION_ID 조건으로 변경
const selectSurvey = `
SELECT 
    v.VERSION_ID,    
    i.ITEM_ID, 
    i.ITEM_NAME, 
    i.DISPLAY_ORDER, 
    s.SUB_ITEM_ID, 
    s.SUB_ITEM_NAME, 
    d.DETAIL_ID, 
    d.QUESTION_TEXT
FROM survey_version v
LEFT JOIN survey_item i ON v.VERSION_ID = i.VERSION_ID
LEFT JOIN survey_sub_item s ON i.ITEM_ID = s.ITEM_ID
LEFT JOIN survey_detail d ON s.SUB_ITEM_ID = d.SUB_ITEM_ID
WHERE v.VERSION_ID = ?  /* 이 부분이 핵심입니다! */
ORDER BY i.DISPLAY_ORDER, s.DISPLAY_ORDER, d.DISPLAY_ORDER;
`;

const insert_item = `
INSERT INTO survey_item (item_name, version_id, display_order)
SELECT 
    ?,        
    ?,
    IFNULL(MAX(display_order), 0) + 1 
FROM survey_item 
WHERE version_id = ?; 
`;

const insert_subitem = `
    INSERT INTO survey_sub_item (sub_item_name, item_id, display_order)
    SELECT ?, ?, IFNULL(MAX(display_order), 0) + 1 
    FROM survey_sub_item
    WHERE item_id = ?
  `;

const insert_detail = `
    INSERT INTO survey_detail (question_text, sub_item_id, display_order)
    SELECT ?, ?, IFNULL(MAX(display_order), 0) + 1 
    FROM survey_detail AS temp
    WHERE sub_item_id = ?
  `;

const selectVersionList = `
  SELECT VERSION_ID, IS_ACTIVE, DATE_FORMAT(CREATE_DATE, '%Y-%m-%d') as CREATE_DATE 
  FROM survey_version 
  ORDER BY VERSION_ID DESC;
`;

const deactivateVersions = `UPDATE survey_version SET IS_ACTIVE = 0 WHERE IS_ACTIVE = 1;`;
const insertNewVersion = `INSERT INTO survey_version (IS_ACTIVE, CREATE_DATE) VALUES (1, NOW());`;

const memberSurvey =
  "SELECT VERSION_ID FROM survey_version WHERE IS_ACTIVE = 1";

// [수정] 1. 지원신청서(application) 마스터 저장
const insert_application = `
  INSERT INTO application (version_id, bene_id, user_id, created_at) 
  VALUES (?, ?, ?, NOW());
`;

// [수정] 2. 조사지답변(survey_answer) 상세 저장
const insert_survey_answer = `
  INSERT INTO survey_answer (answer_value, detail_id, app_id) 
  VALUES (?, ?, ?);
`;
// [조회] 3. 특정 신청서 마스터 정보 가져오기 (버전 ID 확인용)
const select_application_by_id = `
  SELECT app_id, version_id, bene_id, user_id, app_status, DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at
  FROM application 
  WHERE app_id = ?;
`;

// [조회] 4. 특정 신청서의 상세 답변 모두 가져오기
const select_answers_by_app_id = `
  SELECT detail_id, answer_value 
  FROM survey_answer 
  WHERE app_id = ?;
`;
// [목록 조회] 5. 특정 대상자(bene_id)의 신청서 목록 가져오기
const select_application_list_by_bene = `
SELECT 
    a.app_id AS id, 
    a.user_id AS writer, 
    b.bene_name, 
    DATE_FORMAT(a.created_at, '%Y.%m.%d') AS date,
    p.priority_status,
    p.progress_status,
    a.app_status  /* ⭐️ 화면 출력을 위해 추가 */
FROM application a
LEFT JOIN beneficiary_info b ON a.bene_id = b.bene_id
LEFT JOIN priority p ON p.priority_id = (
    SELECT MAX(priority_id) 
    FROM priority 
    WHERE bene_id = a.bene_id
)
WHERE a.bene_id = ?
ORDER BY a.created_at DESC;
`;

const delete_survey_answers = `DELETE FROM survey_answer WHERE app_id = ?;`;
const delete_application = `DELETE FROM application WHERE app_id = ?;`;

// 기존 쿼리에 아래 두 줄을 추가/수정합니다.
const setActiveVersion = `UPDATE survey_version SET IS_ACTIVE = 1 WHERE VERSION_ID = ?;`;
const insertNewDraftVersion = `INSERT INTO survey_version (IS_ACTIVE, CREATE_DATE) VALUES (0, NOW());`;

// [추가] 1. 진행 중인 신청서 개수 확인 (중복 방지)
const check_active_application = `
  SELECT COUNT(*) as cnt 
  FROM application 
  WHERE bene_id = ? AND app_status IN ('대기', '진행중');
`;

// [추가] 2. 신청서 현재 상태 확인 (수정/삭제 방어용)
const select_application_status = `
  SELECT app_status 
  FROM application 
  WHERE app_id = ?;
`;

// [추가] 3. 대기단계 승인 처리 시 상태 업데이트 (요구사항 2)
const update_status_inprogress = `
  UPDATE application 
  SET app_status = '진행중' 
  WHERE app_id = ? AND app_status = '대기';
`;

module.exports = {
  selectSurvey,
  insert_item,
  insert_subitem,
  insert_detail,
  selectVersionList,
  deactivateVersions,
  insertNewVersion,
  // member용
  memberSurvey,
  insert_application,
  insert_survey_answer,
  select_application_by_id,
  select_answers_by_app_id,
  select_application_list_by_bene,
  delete_survey_answers,
  delete_application,
  //구조 변경
  check_active_application,
  select_application_status,
  update_status_inprogress,
};
