const { pool } = require("../DAO");
const noTouchSql = require("../sql/noTouch.js");

const executeQuery = async (query, params = []) => {
  let conn = null;

  try {
    conn = await pool.getConnection();
    return await conn.query(query, params);
  } catch (error) {
    console.error(
      `[DB Error] Query: ${query}\nParams: ${JSON.stringify(params)}\n`,
      error,
    );
    throw error;
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const selectBeneList = async () => executeQuery(noTouchSql.BeneList);

const BeneById = async (beneId) => {
  const rows = await executeQuery(noTouchSql.BeneById, [beneId]);
  return rows[0];
};

const selectManagers = async () => executeQuery(noTouchSql.getManagers);

const updateManager = async (beneId, managerId) =>
  executeQuery(noTouchSql.updateManagerAssign, [managerId, beneId]);

const getLatestPriority = async (beneId) => {
  const rows = await executeQuery(noTouchSql.priorityLatest, [beneId]);
  return rows[0];
};

const insertPriorityHistory = async (
  beneId,
  priorityStatus,
  progressStatus,
  rejectionReason = null,
  parentPriorityId = null,
) =>
  executeQuery(noTouchSql.priorityInsert, [
    beneId,
    priorityStatus,
    progressStatus,
    rejectionReason,
    parentPriorityId,
  ]);

const getRejectHistory = async (beneId) =>
  executeQuery(noTouchSql.priorityRejectHistory, [beneId]);

const cancelPriorityHistory = async (beneId) =>
  executeQuery(noTouchSql.priorityCancel, [beneId]);

module.exports = {
  selectBeneList,
  BeneById,
  selectManagers,
  updateManager,
  getLatestPriority,
  insertPriorityHistory,
  getRejectHistory,
  cancelPriorityHistory,
};
