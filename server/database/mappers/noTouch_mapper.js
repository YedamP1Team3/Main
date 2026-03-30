// 실제 SQL문을 수행
const { pool } = require("../DAO"); // 기존 경로에 맞게 유지
const noTouch = require("../sql/noTouch.js");

// ⭐️ 베테랑의 킥: DB 커넥션 및 에러 처리를 전담하는 공통 Wrapper 함수
// 이 함수 하나로 모든 쿼리의 커넥션 획득, 실행, 반납, 에러 로깅을 중앙 통제합니다.
const executeQuery = async (query, params = []) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(query, params);
    return result;
  } catch (err) {
    // 실무 팁: 에러 발생 시 어떤 쿼리와 파라미터에서 터졌는지 로그를 남기면 디버깅이 10배 빨라집니다.
    console.error(
      `[DB Error] Query: ${query}\nParams: ${JSON.stringify(params)}\n`,
      err,
    );
    throw err;
  } finally {
    if (conn) conn.release(); // 무조건 커넥션 반납
  }
};

// 1. 지원자정보 전체 조회
const selectBeneList = async () => executeQuery(noTouch.BeneList);

// 2. 지원자정보 상세조회
const BeneById = async (id) => {
  const rows = await executeQuery(noTouch.BeneById, [id]);
  return rows[0]; // 단건 조회이므로 첫 번째 요소만 반환
};

// 3. 담당자 목록 가져오기
const selectManagers = async () => executeQuery(noTouch.getManagers);

// 4. 담당자 배정 업데이트
const updateManager = async (bene_id, manager_id) =>
  executeQuery(noTouch.updateManagerAssign, [manager_id, bene_id]);

// 5. 대기단계 최신 정보 조회 (매니저/관리자 현재 상태 파악용)
const getLatestPriority = async (bene_id) => {
  const rows = await executeQuery(noTouch.priorityLatest, [bene_id]);
  return rows[0]; // 데이터가 없으면 undefined 반환
};

// 6. 대기단계 이력 추가 (모든 액션 공통)
// Service에서 progress_status(pending, approved, rejected) 값을 결정하여 넘겨줍니다.
const insertPriorityHistory = async (
  bene_id,
  priority_status,
  progress_status,
  rejection_reason = null,
  priority_id2 = null,
) => {
  return executeQuery(noTouch.priorityInsert, [
    bene_id,
    priority_status,
    progress_status,
    rejection_reason,
    priority_id2,
  ]);
};

// 7. 반려 이력 조회 (관리자용)
const getRejectHistory = async (bene_id) => {
  return executeQuery(noTouch.priorityRejectHistory, [bene_id]);
};
// 8. 승인 대기중 삭제
const cancelPriorityHistory = async (bene_id) => {
  return executeQuery(noTouch.priorityCancel, [bene_id]);
};

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
