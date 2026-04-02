const rsvMapper = require("../database/mappers/rsv_mapper.js");

const resolveManagerId = async ({ userId, userRole, beneId }) => {
  // 담당자면 본인 userId 그대로 사용
  if (userRole === "MANAGER") {
    return userId;
  }

  // 보호자면 beneId로 담당자 조회
  if (userRole === "FAMILY") {
    if (!beneId) {
      throw new Error("beneId 파라미터가 필요합니다.");
    }

    const beneficiaryRows = await rsvMapper.getBeneficiaryManagerInfo(beneId);

    const beneficiary = beneficiaryRows[0];

    if (!beneficiary) {
      throw new Error("지원대상자 정보를 찾을 수 없습니다.");
    }

    if (beneficiary.family_id !== userId) {
      throw new Error("해당 지원대상자 조회 권한이 없습니다.");
    }

    if (!beneficiary.manager_id) {
      throw new Error("배정된 담당자가 없습니다.");
    }

    return beneficiary.manager_id;
  }

  throw new Error("manager_id를 조회할 수 없는 사용자 권한입니다.");
};

const getBeneficiariesByFamilyId = async (familyId) => {
  return await rsvMapper.getBeneficiariesByFamilyId(familyId);
};

// -----------------------------------reservation REST--------------------------
const createReservation = async (beneId, managerId, date, times) => {
  const ranges = mergeTimes(times);
  const results = [];

  for (const range of ranges) {
    const startDateTime = `${date} ${range.start_time}:00`;
    const endDateTime = `${date} ${range.end_time}:00`;

    const insertId = await rsvMapper.insertReservation(
      beneId,
      managerId,
      startDateTime,
      endDateTime,
    );

    results.push({
      rsv_id: insertId,
      bene_id: beneId,
      manager_id: managerId,
      start_time: startDateTime,
      end_time: endDateTime,
      // rsv_status: 'REQUESTED'
    });
  }

  return results;
};

const getFamilyReservations = async (userId, role) => {
  // 지금은 보호자 화면에서만 쓰는 API이므로
  // 필요하면 여기서 role 검증을 추가할 수 있음.
  // 예: if (role !== 'FAMILY') throw new Error('권한이 없습니다.');

  const reservationList = await rsvMapper.selectFamilyReservations(userId);

  return reservationList || [];
};

const cancelReservation = async (rsvId) => {
  const result = await rsvMapper.deleteReservation(rsvId);

  // mysql2 기준으로 affectedRows로 삭제 성공 여부 판단
  if (!result || result.affectedRows === 0) {
    return false;
  }

  return true;
};

// -----------------------------------managerSchedule REST--------------------------

// 담당자 시간표 1달치 추가 API
// YYYY-MM-DD 포맷
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// 다음 달 시작일 / 종료일 계산
const getNextMonthRange = () => {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }),
  );
  const year = now.getFullYear();
  const month = now.getMonth();

  const startDate = new Date(year, month + 1, 1);
  const endDate = new Date(year, month + 2, 0);

  return { startDate, endDate };
};

// 다음 달 평일 목록 생성
const getNextMonthWeekdays = () => {
  const { startDate, endDate } = getNextMonthRange();
  const result = [];

  const current = new Date(startDate);

  while (current <= endDate) {
    const day = current.getDay(); // 0 일요일, 6 토요일

    if (day !== 0 && day !== 6) {
      result.push(formatDate(current));
    }

    current.setDate(current.getDate() + 1);
  }

  return result;
};

// 다음 달 manager_schedules 자동 생성
const generateNextMonthSchedules = async () => {
  const managers = await rsvMapper.selectActiveManagers();

  if (!managers || managers.length === 0) {
    return {
      success: true,
      inserted: 0,
      totalTarget: 0,
      message: "ACTIVE 상태의 MANAGER가 없습니다.",
    };
  }

  const weekdays = getNextMonthWeekdays();

  if (weekdays.length === 0) {
    return {
      success: true,
      inserted: 0,
      totalTarget: 0,
      message: "생성할 평일이 없습니다.",
    };
  }

  const values = [];

  for (const manager of managers) {
    for (const workDate of weekdays) {
      values.push([manager.user_id, workDate, "09:00:00", "18:00:00"]);
    }
  }

  if (values.length === 0) {
    return {
      success: true,
      inserted: 0,
      totalTarget: 0,
      message: "생성할 스케줄 데이터가 없습니다.",
    };
  }

  const insertResult = await rsvMapper.insertManagerSchedules(values);

  return {
    success: true,
    inserted: insertResult.affectedRows || 0,
    totalTarget: values.length,
    message: "다음 달 평일 스케줄 자동 생성 완료",
  };
};

// 담당자 조회
const getManagerSchedule = async (managerId, date) => {
  const schedule = await rsvMapper.selectManagerSchedule(managerId, date);

  if (!schedule) return null;

  // 🔥 추가
  const reserved = await rsvMapper.selectReservedTimes(managerId, date);
  console.log("service.reserved : ", reserved);

  const blocked = await rsvMapper.selectBlockedTimes(managerId, date);
  console.log("service.blocked : ", blocked);

  const blockedSummary = blocked.map((item) => ({
    start_time: item.start_time.slice(11, 16),
    end_time: item.end_time.slice(11, 16),
  }));

  return {
    ...schedule,
    reserved_times: reserved,
    blocked_times: blocked,
    blocked_summary: blockedSummary,
  };
};

// timeSlot 선택 → 구간으로 합치기
const mergeTimes = (times) => {
  const sorted = times.sort();

  const result = [];
  let start = sorted[0];
  let prev = sorted[0];

  const add30Min = (time) => {
    let [h, m] = time.split(":").map(Number);
    m += 30;
    if (m >= 60) {
      m = 0;
      h += 1;
    }
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];

    if (current === add30Min(prev)) {
      prev = current;
    } else {
      result.push({
        start_time: start,
        end_time: add30Min(prev),
      });
      start = current;
      prev = current;
    }
  }

  // 마지막 구간
  result.push({
    start_time: start,
    end_time: add30Min(prev),
  });

  return result;
};

const createBlockedTimes = async (managerId, date, times) => {
  const ranges = mergeTimes(times);

  const existing = await rsvMapper.selectBlockedTimes(managerId, date);

  for (const range of ranges) {
    const newStart = new Date(`${date}T${range.start_time}:00`).getTime();
    const newEnd = new Date(`${date}T${range.end_time}:00`).getTime();

    for (const ex of existing) {
      const exStart = new Date(ex.start_time).getTime();
      const exEnd = new Date(ex.end_time).getTime();

      if (newStart < exEnd && newEnd > exStart) {
        throw new Error("이미 예약 또는 차단된 시간입니다.");
      }
    }

    await rsvMapper.insertBlockedTime(
      managerId,
      date,
      range.start_time,
      range.end_time,
    );
  }
};

const removeBlockedTimes = async (managerId, date, times) => {
  const ranges = mergeTimes(times);

  let totalDeleted = 0;

  for (const range of ranges) {
    const count = await rsvMapper.deleteBlockedTime(
      managerId,
      date,
      range.start_time,
      range.end_time,
    );

    totalDeleted += count;
  }

  // 🔥 삭제된 게 없으면 에러 처리
  if (totalDeleted === 0) {
    throw new Error("해당 시간에 해제할 예약불가 데이터가 없습니다.");
  }

  return totalDeleted;
};

// -----------------------------------manageReservation API--------------------------

const getManagerReservations = async (managerId) => {
  try {
    const rows = await rsvMapper.selectManagerReservations(managerId);
    return rows;
  } catch (err) {
    console.error("getManagerReservations error:", err);
    throw err;
  }
};

const processReservation = async (rsvId, decision) => {
  try {
    const allowedStatus = ["APPROVED", "REJECTED"];

    if (!allowedStatus.includes(decision)) {
      const error = new Error("유효하지 않은 처리 상태입니다.");
      error.statusCode = 400;
      throw error;
    }

    const result = await rsvMapper.updateReservationStatus(rsvId, decision);

    if (!result || result.affectedRows === 0) {
      const error = new Error(
        "처리할 수 없는 예약입니다. 이미 처리되었거나 존재하지 않습니다.",
      );
      error.statusCode = 400;
      throw error;
    }

    return result;
  } catch (err) {
    console.error("processReservation error:", err);
    throw err;
  }
};

// -----------------------------------counseling API--------------------------

const createCounselingNote = async (noteData) => {
  const { rsvId, counselingType, title, content, futurePlan } = noteData;

  // 필수값 검증
  if (!rsvId || !counselingType || !title || !content || !futurePlan) {
    throw new Error("필수 입력값이 누락되었습니다.");
  }

  // 상담일지 등록
  const insertResult = await rsvMapper.insertCounselingNote({
    rsvId,
    counselingType,
    title,
    content,
    futurePlan,
  });

  // 예약 상태 NOTE_WRITTEN 변경
  await rsvMapper.updateReservationStatusToNoteWritten(rsvId);

  return {
    noteId: insertResult.insertId,
    rsvId,
    message: "상담일지가 등록되었습니다.",
  };
};

module.exports = {
  getManagerSchedule,
  getFamilyReservations,
  cancelReservation,
  createReservation,
  createBlockedTimes,
  removeBlockedTimes,
  generateNextMonthSchedules,
  getBeneficiariesByFamilyId,
  resolveManagerId,
  getManagerReservations,
  processReservation,
  createCounselingNote,
};
