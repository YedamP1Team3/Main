// database/mappers/survey_mapper.js
const { pool } = require("../DAO");
const surveySql = require("../sql/servey.js");

// 🚨 [수정] 함수 정의 부분에 (versionId) 인자를 반드시 추가해야 합니다!
const selectSurvey = async (versionId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();

    // 💡 디버깅용 로그: 실제로 DB에 어떤 ID를 던지는지 확인
    console.log("DB 조회 시도 versionId:", versionId);

    // [ ] 배열 안에 versionId를 넣어서 SQL의 ? 자리에 매칭시킵니다.
    let rows = await conn.query(surveySql.selectSurvey, [versionId]);

    return rows;
  } catch (err) {
    console.error("Mapper Error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const insertItem = async (params) => {
  try {
    const result = await pool.query(surveySql.insert_item, [
      params.item_name,
      params.version_id,
      params.version_id,
    ]);
    return result;
  } catch (dbError) {
    console.error("!!! DB 실행 중 진짜 에러 발생 !!!");
    console.error(dbError);
    throw dbError;
  }
};

const insertSubItem = async (params) => {
  const result = await pool.query(surveySql.insert_subitem, [
    params.sub_item_name,
    params.item_id,
    params.item_id,
  ]);
  return result;
};

const insertSurveyDetail = async (params) => {
  const result = await pool.query(surveySql.insert_detail, [
    params.question_text,
    params.sub_item_id,
    params.sub_item_id,
  ]);
  return result;
};

const deleteItems = (ids) =>
  pool.query("DELETE FROM survey_item WHERE item_id IN (?)", [ids]);
const deleteSubItems = (ids) =>
  pool.query("DELETE FROM survey_sub_item WHERE sub_item_id IN (?)", [ids]);
const deleteDetails = (ids) =>
  pool.query("DELETE FROM survey_detail WHERE detail_id IN (?)", [ids]);

// ⭐️ 추가: 버전 목록을 가져오는 매퍼 함수
const getVersions = async () => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    // surveySql에 selectVersionList 쿼리가 정의되어 있어야 합니다.
    let rows = await conn.query(
      surveySql.selectVersionList ||
        "SELECT * FROM survey_version ORDER BY VERSION_ID DESC",
    );
    return rows;
  } finally {
    if (conn) conn.release();
  }
};

const createNewVersion = async () => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1. 기존 모든 버전 비활성화
    await conn.query(surveySql.deactivateVersions);

    // 2. 새 버전 생성
    // 🚨 [수정] [result] 대신 result로 받고, insertId가 어디에 있는지 확인합니다.
    const result = await conn.query(
      surveySql.insert_version || surveySql.insertNewVersion,
    );

    await conn.commit();

    // 💡 MariaDB/MySQL용 안전한 insertId 추출
    // 결과가 배열로 오면 첫 번째 요소에서, 객체로 오면 바로 insertId를 가져옵니다.
    const insertId =
      result.insertId ||
      (result[0] && result[0].insertId) ||
      result.affectedRows;

    console.log("새로 생성된 버전 ID:", insertId);
    return insertId;
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Mapper Error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
module.exports = {
  selectSurvey,
  insertItem,
  insertSubItem,
  insertSurveyDetail,
  deleteItems,
  deleteSubItems,
  deleteDetails,
  getVersions, // 추가됨
  createNewVersion,
};
