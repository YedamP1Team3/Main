//실제 SQL문을 수행
const { pool } = require("../DAO");
const userSql = require("../sql/user.js");

const selectAllUser = async () => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(userSql.selectAllUser);
    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

//지원자정보
const selectBeneficiariesNames = async (managerId) => {
  let conn = null;
  try {
    conn = await pool.getConnection(managerId);
    let rows = await conn.query(userSql.selectBeneficiariesNames, [managerId]);
    return rows;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
//지원자정보 상세조회
const selectBeneficiariesDetail = async (id) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(userSql.selectBeneficiariesDetail, [id]);
    return rows[0];
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
//지원계획서 해당아이디 조회
const selectSupportPlanList = async (beneId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(userSql.selectSupportPlanList, [beneId]);
    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};
//지원계획서생성
const createSupportPlan = async (supportPlan) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(userSql.createSupportPlan, supportPlan);
    return result;
  } catch (err) {
  } finally {
    if (conn) conn.release();
  }
};
//지원계획서임시생성
const createTempPlan = async (supportPlan) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(userSql.createTempPlan, supportPlan);
    return result;
  } catch (err) {
  } finally {
    if (conn) conn.release();
  }
};
//지원계회서임시조회
const selectSupportPlanTempList = async (beneId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(userSql.selectSupportPlanTempList, [beneId]);
    return rows;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};
//지원계획서상세조회
const selectSupportPlanDetail = async (planId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(userSql.selectSupportPlanDetail, [planId]);
    return rows[0];
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};
//지원계획서임시상세조회
const selectTempPlanDetail = async (planId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(userSql.selectTempPlanDetail, [planId]);
    return rows[0];
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};

//지원계획서삭제
const removeSupportPlan = async (planDelete) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(userSql.removeSupportPlan, planDelete);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};
//임시지원계획서 삭제
const removeTempPlan = async (planDelete) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(userSql.removeTempPlan, planDelete);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) conn.release();
  }
};
//지원계획서 승인요청
const resubmitSupportPlan = async (planId, planDate) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let result = await conn.query(userSql.resubmitSupportPlan, [
      planDate.plan_objective,
      planDate.plan_content,
      planId,
    ]);
    await conn.commit();
    return result;
  } catch (err) {
    console.log(err);
    if (conn) await conn.rollback();
  } finally {
    if (conn) conn.release();
  }
};
//지원계획서 반려처리
const rejectSupportPlan = async (planId, planDate) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let result = await conn.query(userSql.rejectSupportPlan, [
      planDate.plan_objective,
      planDate.plan_content,
      planId,
    ]);
    await conn.commit();
    return result;
  } catch (err) {
    console.log(err);
    if (conn) await conn.rollback();
  } finally {
    if (conn) conn.release();
  }
};

//지원계획서업데이트(임시)
const updateTempPlan = async (planDraftId, planDate) => {
  console.log("매퍼로 들어온 데이터:", planDate);
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let result = await conn.query(userSql.updateTempPlan, [
      planDate.plan_objective,
      planDate.plan_content,
      planDraftId,
    ]);
    await conn.commit();
    return result;
  } catch (err) {
    console.log(err);
    if (conn) await conn.rollback();
  } finally {
    if (conn) conn.release();
  }
};
//지원계획서 파일 추가
const insertAttachment = async (fileData) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    // 서비스에서 넘겨준 [planId, null, originName, fileName, fileSize] 배열을 쿼리에 매핑
    let result = await conn.query(userSql.insertAttachment, fileData);
    return result;
  } catch (err) {
    console.error("Mapper 에러 (insertAttachment): ", err);
    throw err; // 에러를 위로 던져서 서비스에서 알 수 있게 함
  } finally {
    if (conn) conn.release(); // 연결 해제
  }
};
//지원계획서 파일 조회
const selectAttachments = async (planId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    // userSql.selectAttachmentsByPlanId는 아래 3번에서 만들 SQL 이름입니다.
    let result = await conn.query(userSql.selectAttachments, [planId]);
    return result;
  } catch (err) {
    console.error("매퍼 에러 (getAttachments):", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
//임시지원계획서 파일 조회
const selectDraftAttachments = async (planDraftId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(userSql.selectDraftAttachments, [
      planDraftId,
    ]);
    return result;
  } catch (err) {
    console.error("매퍼 에러 (selectDraftAttachments):", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
//지원계획서 파일 삭제
const deleteAttachments = async (planId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(userSql.deleteAttachments, [planId]);
    return result;
  } catch (err) {
    console.error("매퍼 에러 (deleteAttachments):", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
//임시지원계획서 파일 삭제
const deleteDraftAttachments = async (planDraftId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(userSql.deleteDraftAttachments, [
      planDraftId,
    ]);
    return result;
  } catch (err) {
    console.error("매퍼 에러 (deleteDraftAttachments):", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
//임시지원계획서 파일을 지원계획서로 이동
const moveDraftAttachmentsToPlan = async (planId, planDraftId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(userSql.moveDraftAttachmentsToPlan, [
      planId,
      planDraftId,
    ]);
    return result;
  } catch (err) {
    console.error("매퍼 에러 (moveDraftAttachmentsToPlan):", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
//임시지원계획서 파일 상세조회
const selectDraftAttachment = async (planDraftId, fileId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(userSql.selectDraftAttachment, [
      planDraftId,
      fileId,
    ]);
    return rows[0] || null;
  } catch (err) {
    console.error("매퍼 에러 (selectDraftAttachment):", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
//지원계획서 파일 상세조회
const selectPlanAttachment = async (planId, fileId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let rows = await conn.query(userSql.selectPlanAttachment, [planId, fileId]);
    return rows[0] || null;
  } catch (err) {
    console.error("매퍼 에러 (selectPlanAttachment):", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
//임시지원계획서 파일 삭제
const deleteDraftAttachment = async (planDraftId, fileId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(userSql.deleteDraftAttachment, [
      planDraftId,
      fileId,
    ]);
    return result;
  } catch (err) {
    console.error("매퍼 에러 (deleteDraftAttachment):", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
//지원계획서 파일 삭제
const deletePlanAttachment = async (planId, fileId) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    let result = await conn.query(userSql.deletePlanAttachment, [planId, fileId]);
    return result;
  } catch (err) {
    console.error("매퍼 에러 (deletePlanAttachment):", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

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
  selectDraftAttachments,
  deleteAttachments,
  deleteDraftAttachments,
  moveDraftAttachmentsToPlan,
  selectDraftAttachment,
  deleteDraftAttachment,
  selectPlanAttachment,
  deletePlanAttachment,
};
