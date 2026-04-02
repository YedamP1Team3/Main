const { pool } = require("../DAO");
const noTouchSql = require("../sql/noTouch.js");

const runQuery = async (query, params = []) => {
  let conn = null;

  try {
    conn = await pool.getConnection();
    return await conn.query(query, params);
  } catch (err) {
    throw err;
  } finally {
    // 단순 조회도 커넥션을 빌렸다면 반드시 반납해야 한다.
    // release를 빼먹으면 pool이 점점 막혀 다음 요청이 대기하게 된다.
    if (conn) {
      conn.release();
    }
  }
};

const selectBeneList = async () => {
  return runQuery(noTouchSql.BeneList);
};

const BeneById = async (beneId) => {
  const rows = await runQuery(noTouchSql.BeneById, [beneId]);
  return rows.length > 0 ? rows[0] : null;
};

const selectManagers = async () => {
  return runQuery(noTouchSql.getManagers);
};

// 담당자 배정은 beneficiary_info update와 manager_log insert가 항상 같이 맞아야 한다.
// 한쪽만 저장되면 "현재 담당자"와 "배정 이력"이 서로 다른 사실을 가리키게 되므로
// 하나의 트랜잭션으로 묶어 원자적으로 처리한다.
const updateManagerWithLog = async (beneId, managerId, adminId) => {
  let conn = null;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const updateResult = await conn.query(noTouchSql.updateManagerAssign, [
      managerId,
      beneId,
    ]);

    if (updateResult.affectedRows === 0) {
      throw new Error("담당자를 배정할 지원대상자를 찾을 수 없습니다.");
    }

    await conn.query(noTouchSql.insertManagerLog, [beneId, managerId, adminId]);

    await conn.commit();
    return updateResult;
  } catch (err) {
    if (conn) {
      await conn.rollback();
    }
    throw err;
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const getManagerAssignHistory = async (beneId) => {
  return runQuery(noTouchSql.selectManagerAssignHistory, [beneId]);
};

const getLatestPriority = async (beneId) => {
  const rows = await runQuery(noTouchSql.priorityLatest, [beneId]);
  return rows.length > 0 ? rows[0] : null;
};

const insertPriorityHistory = async (
  beneId,
  priorityStatus,
  progressStatus,
  rejectionReason = null,
  parentPriorityId = null,
) => {
  return runQuery(noTouchSql.priorityInsert, [
    beneId,
    priorityStatus,
    progressStatus,
    rejectionReason,
    parentPriorityId,
  ]);
};

const getRejectHistory = async (beneId) => {
  return runQuery(noTouchSql.priorityRejectHistory, [beneId]);
};

const cancelPriorityHistory = async (beneId) => {
  return runQuery(noTouchSql.priorityCancel, [beneId]);
};

module.exports = {
  selectBeneList,
  BeneById,
  selectManagers,
  updateManagerWithLog,
  getManagerAssignHistory,
  getLatestPriority,
  insertPriorityHistory,
  getRejectHistory,
  cancelPriorityHistory,
};
