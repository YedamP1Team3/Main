const { pool } = require("../DAO");
const resultSql = require("../sql/result.js");

const selectSupportResultList = async (beneId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(resultSql.selectSupportResultList, [beneId]);
    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const selectSupportResultTempList = async (beneId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(resultSql.selectSupportResultTempList, [
      beneId,
    ]);
    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const createSupportResult = async (newResult) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(resultSql.createSupportResult, newResult);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const createTempResult = async (newResult) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(resultSql.createTempResult, newResult);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const insertMapping = async (mappingValues) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const result = await conn.batch(resultSql.insertMapping, mappingValues);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const selectApprovedPlanList = async (beneId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(resultSql.selectApprovedPlanList, [beneId]);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const selectSupportResultDetail = async (result) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(resultSql.selectSupportResultDetail, [result]);
    return rows[0];
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const selectLinkedPlanList = async (result) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(resultSql.selectLinkedPlanList, [result]);
    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const removeSupportResult = async (resultId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(resultSql.removeSupportResult, resultId);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const removeTempResult = async (resultId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(resultSql.removeTempResult, resultId);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

const removeMapping = async (resultId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(resultSql.removeMapping, resultId);
    return result;
  } catch (err) {
    console.error("removeMapping 에러:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const removeTempMapping = async (resultId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(resultSql.removeTempMapping, resultId);
    return result;
  } catch (err) {
    console.error("removeMapping 에러:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const applySupportResult = async (resultId, resultDate) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let result = await conn.query(resultSql.applySupportResult, [
      resultDate.result_title,
      resultDate.result_content,
      resultId,
    ]);
    await conn.commit();
    return result;
  } catch (err) {
    console.error("applySupportResult 에러:", err);
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const updateTempSupportResult = async (resultId, resultDate) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let result = await conn.query(resultSql.updateTempSupportResult, [
      resultDate.result_title,
      resultDate.result_content,
      resultId,
    ]);
    await conn.commit();
    return result;
  } catch (err) {
    console.error("updateTempSupportResult 에러:", err);
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const selectSupportResultTempDetail = async (resultId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(resultSql.selectSupportResultTempDetail, [
      resultId,
    ]);
    return rows[0]; // 단건 조치이므로 첫 번째 행 반환
  } catch (err) {
    console.error("임시저장 상세조회 매퍼 에러:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const insertTempMapping = async (draftId, planIds) => {
  let conn = await pool.getConnection();
  try {
    // 1. [[draftId, p1], [draftId, p2]] 형태의 2차원 배열 생성
    const values = planIds.map((id) => [draftId, id]);

    // 2. batch는 (?, ?) 쿼리에 2차원 배열을 넣으면 순회하며 삽입합니다.
    // [values] 처럼 대괄호를 씌우면 에러가 나므로 'values'만 전달합니다.
    await conn.batch(resultSql.insertTempMapping, values);
  } catch (err) {
    console.error("매핑 삽입 중 에러:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const selectLinkedTempList = async (draftId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(resultSql.selectLinkedTempList, [draftId]);
    return rows;
  } catch (err) {
    console.error("임시 매핑 목록 조회 에러:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const insertResultAttachment = async (fileData) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(resultSql.insertResultAttachment, fileData);
    return result;
  } catch (err) {
    console.error("매퍼 에러 (insertResultAttachment):", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const selectResultAttachments = async (resultId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(resultSql.selectResultAttachments, [resultId]);
    return rows;
  } catch (err) {
    console.error("매퍼 에러 (selectResultAttachments):", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const selectDraftResultAttachments = async (resultDraftId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(resultSql.selectDraftResultAttachments, [
      resultDraftId,
    ]);
    return rows;
  } catch (err) {
    console.error("매퍼 에러 (selectDraftResultAttachments):", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const selectResultAttachment = async (resultId, fileId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(resultSql.selectResultAttachment, [
      resultId,
      fileId,
    ]);
    return rows[0] || null;
  } catch (err) {
    console.error("매퍼 에러 (selectResultAttachment):", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const selectDraftResultAttachment = async (resultDraftId, fileId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(resultSql.selectDraftResultAttachment, [
      resultDraftId,
      fileId,
    ]);
    return rows[0] || null;
  } catch (err) {
    console.error("매퍼 에러 (selectDraftResultAttachment):", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const deleteResultAttachment = async (resultId, fileId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(resultSql.deleteResultAttachment, [
      resultId,
      fileId,
    ]);
    return result;
  } catch (err) {
    console.error("매퍼 에러 (deleteResultAttachment):", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const deleteDraftResultAttachment = async (resultDraftId, fileId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(resultSql.deleteDraftResultAttachment, [
      resultDraftId,
      fileId,
    ]);
    return result;
  } catch (err) {
    console.error("매퍼 에러 (deleteDraftResultAttachment):", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const deleteResultAttachments = async (resultId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(resultSql.deleteResultAttachments, [resultId]);
    return result;
  } catch (err) {
    console.error("매퍼 에러 (deleteResultAttachments):", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const deleteDraftResultAttachments = async (resultDraftId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(resultSql.deleteDraftResultAttachments, [
      resultDraftId,
    ]);
    return result;
  } catch (err) {
    console.error("매퍼 에러 (deleteDraftResultAttachments):", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const moveDraftResultAttachmentsToResult = async (resultId, resultDraftId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(resultSql.moveDraftResultAttachmentsToResult, [
      resultId,
      resultDraftId,
    ]);
    return result;
  } catch (err) {
    console.error("매퍼 에러 (moveDraftResultAttachmentsToResult):", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// 반려 처리 (반려/수정중)
const rejectSupportResult = async (title, content, resultId) => {
  let conn = await pool.getConnection();
  try {
    return await conn.query(resultSql.rejectSupportResult, [title, content, resultId]);
  } finally {
    if (conn) conn.release();
  }
};

// 재승인 처리 (반려/재승인)
const resubmitSupportResult = async (resultId, updateData) => {
  let conn = await pool.getConnection();
  try {
    const { title, content } = updateData;
    return await conn.query(resultSql.resubmitSupportResult, [title, content, resultId]);
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  selectSupportResultList,
  selectSupportResultTempList,
  createSupportResult,
  insertMapping,
  selectApprovedPlanList,
  selectSupportResultDetail,
  selectLinkedPlanList,
  removeSupportResult,
  removeMapping,
  applySupportResult,
  updateTempSupportResult,
  createTempResult,
  selectSupportResultTempDetail,
  insertTempMapping,
  selectLinkedTempList,
  removeTempResult,
  removeTempMapping,
  insertResultAttachment,
  selectResultAttachments,
  selectDraftResultAttachments,
  selectResultAttachment,
  selectDraftResultAttachment,
  deleteResultAttachment,
  deleteDraftResultAttachment,
  deleteResultAttachments,
  deleteDraftResultAttachments,
  moveDraftResultAttachmentsToResult,
  rejectSupportResult,
  resubmitSupportResult
};
