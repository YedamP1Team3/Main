//실제 SQL문을 수행
const { pool } = require("../DAO");
const surveySql = require("../sql/servey.js");

const selectSurvey = async () => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    // [ ]를 제거하고 결과 전체를 받습니다.
    let rows = await conn.query(surveySql.selectSurvey);

    console.log("DB Raw Data:", rows);
    return rows;
  } catch (err) {
    console.error("Mapper Error:", err);
    throw err; // 에러를 Service로 던져서 처리하게 함
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
    console.error(dbError); // 이 로그가 핵심입니다.
    throw dbError;
  }
};

// 서브 항목 추가용
const insertSubItem = async (params) => {
  // 물음표 3개: 이름, 부모ID, 부모ID(WHERE용)
  const result = await pool.query(surveySql.insert_subitem, [
    params.sub_item_name,
    params.item_id,
    params.item_id,
  ]);
  return result;
};

// 질문(Detail) 추가용
const insertSurveyDetail = async (params) => {
  // 물음표 3개: 질문내용, 서브항목ID, 서브항목ID(WHERE용)
  const result = await pool.query(surveySql.insert_detail, [
    params.question_text,
    params.sub_item_id,
    params.sub_item_id,
  ]);
  return result;
};

// 매퍼 파일 (간략화)
const deleteItems = (ids) =>
  pool.query("DELETE FROM survey_item WHERE item_id IN (?)", [ids]);
const deleteSubItems = (ids) =>
  pool.query("DELETE FROM survey_sub_item WHERE sub_item_id IN (?)", [ids]);
const deleteDetails = (ids) =>
  pool.query("DELETE FROM survey_detail WHERE detail_id IN (?)", [ids]);

module.exports = {
  selectSurvey,
  insertItem,
  insertSubItem,
  insertSurveyDetail,
  deleteItems,
  deleteSubItems,
  deleteDetails,
};
