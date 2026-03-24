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

// 1. APPLICATION (지원신청서) 테이블에 데이터 삽입
// USER_ID는 나중에 실제 로그인 세션에서 가져온 값으로 교체될 수 있도록 변수로 받습니다.
const appQuery = `
      INSERT INTO APPLICATION (VERSION_ID, BENE_ID, USER_ID, CREATED_AT) 
      VALUES (?, ?, ?, NOW())
    `;

const answerQuery = `
        INSERT INTO Survey_Answer (ANSWER_VALUE, DETAIL_ID, APP_ID) 
        VALUES ?
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
  appQuery,
  answerQuery,
};
