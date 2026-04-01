// sql/servey.js

// [조회] 설문 구조 전체 조회
// 실무 팁: DB에서 조회할 때부터 컬럼명을 철저히 소문자로 지정합니다.
// 이렇게 하면 Node.js로 데이터가 넘어올 때 무조건 소문자 키(row.item_id)로 떨어지므로
// 불필요한 대소문자 구분 방어 코드를 작성할 필요가 없어집니다.
const selectSurvey = `
SELECT 
    v.version_id,    
    i.item_id, 
    i.item_name, 
    i.display_order AS item_display_order, 
    s.sub_item_id, 
    s.sub_item_name, 
    d.detail_id, 
    d.question_text
FROM survey_version v
LEFT JOIN survey_item i ON v.version_id = i.version_id
LEFT JOIN survey_sub_item s ON i.item_id = s.item_id
LEFT JOIN survey_detail d ON s.sub_item_id = d.sub_item_id
WHERE v.version_id = ?  /* 사용자가 입력한 값은 무조건 ? 로 받아서 SQL 인젝션을 원천 차단합니다. */
ORDER BY i.display_order, s.display_order, d.display_order;
`;

// [저장] 설문 대분류(Item) 추가
const insert_item = `
INSERT INTO survey_item (item_name, version_id, display_order)
SELECT 
    ?,        
    ?,
    IFNULL(MAX(display_order), 0) + 1 
FROM survey_item 
WHERE version_id = ?; 
`;

// [저장] 설문 중분류(SubItem) 추가
const insert_subitem = `
INSERT INTO survey_sub_item (sub_item_name, item_id, display_order)
SELECT ?, ?, IFNULL(MAX(display_order), 0) + 1 
FROM survey_sub_item
WHERE item_id = ?;
`;

// [저장] 설문 상세 질문(Detail) 추가
const insert_detail = `
INSERT INTO survey_detail (question_text, sub_item_id, display_order)
SELECT ?, ?, IFNULL(MAX(display_order), 0) + 1 
FROM survey_detail AS temp
WHERE sub_item_id = ?;
`;

// [조회] 설문 버전 목록 조회
const selectVersionList = `
SELECT version_id, is_active, DATE_FORMAT(create_date, '%Y-%m-%d') as create_date 
FROM survey_version 
ORDER BY version_id DESC;
`;

// [수정] 모든 버전 비활성화
const deactivateVersions = `UPDATE survey_version SET is_active = 0 WHERE is_active = 1;`;

// [저장] 새로운 활성 버전 생성
const insertNewVersion = `INSERT INTO survey_version (is_active, create_date) VALUES (1, NOW());`;

// [조회] 멤버용 현재 활성화된 버전 확인
const memberSurvey = `SELECT version_id FROM survey_version WHERE is_active = 1;`;

// [저장] 지원신청서 마스터 정보
const insert_application = `
INSERT INTO application (version_id, bene_id, user_id, created_at) 
VALUES (?, ?, ?, NOW());
`;

// [저장] 조사지 상세 답변
// 실무 팁: mariadb 드라이버의 conn.batch()를 사용하면, 이 한 줄짜리 쿼리로도
// 수십 개의 답변 배열을 한 번의 네트워크 통신으로 DB에 밀어 넣을 수 있습니다(Bulk Insert).
const insert_survey_answer = `
INSERT INTO survey_answer (answer_value, detail_id, app_id) 
VALUES (?, ?, ?);
`;

// [조회] 신청서 마스터 정보 단건 조회
const select_application_by_id = `
SELECT app_id, version_id, bene_id, user_id, app_status, DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at
FROM application 
WHERE app_id = ?;
`;

// [조회] 특정 신청서의 상세 답변 전체 조회
const select_answers_by_app_id = `
SELECT detail_id, answer_value 
FROM survey_answer 
WHERE app_id = ?;
`;

// [조회] 특정 대상자의 신청서 목록
const select_application_list_by_bene = `
SELECT 
    a.app_id AS id, 
    a.user_id AS writer, 
    b.bene_name, 
    DATE_FORMAT(a.created_at, '%Y.%m.%d') AS date,
    p.priority_status,
    p.progress_status,
    a.app_status
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

// [삭제] 신청서 연관 데이터 일괄 삭제용 쿼리들
const delete_survey_answers = `DELETE FROM survey_answer WHERE app_id = ?;`;
const delete_application = `DELETE FROM application WHERE app_id = ?;`;

// [수정/저장] 버전 관리용
const setActiveVersion = `UPDATE survey_version SET is_active = 1 WHERE version_id = ?;`;
const insertNewDraftVersion = `INSERT INTO survey_version (is_active, create_date) VALUES (0, NOW());`;

// [조회] 대상자의 활성화된(대기, 진행중) 신청서 개수 카운트
const check_active_application = `
SELECT COUNT(*) as cnt 
FROM application 
WHERE bene_id = ? AND app_status IN ('대기', '진행중');
`;

// [조회] 신청서의 현재 상태 확인 (함부로 삭제하지 못하게 방어)
const select_application_status = `
SELECT app_status 
FROM application 
WHERE app_id = ?;
`;

// [수정] 신청서 상태를 '진행중'으로 변경
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
  memberSurvey,
  insert_application,
  insert_survey_answer,
  select_application_by_id,
  select_answers_by_app_id,
  select_application_list_by_bene,
  delete_survey_answers,
  delete_application,
  check_active_application,
  select_application_status,
  update_status_inprogress,
  setActiveVersion,
  insertNewDraftVersion,
};
