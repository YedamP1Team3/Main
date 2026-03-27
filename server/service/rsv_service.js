const rsvMapper = require("../database/mappers/rsv_mapper.js");

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
  const occupied = await rsvMapper.selectAllOccupiedTimes(managerId, date);

  return {
    ...schedule,
    occupied_times: occupied,
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

  const existing = await rsvMapper.selectAllOccupiedTimes(managerId, date);

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

    console.log("service.range : ", range);

    totalDeleted += count;
    console.log("totalDeleted : ", totalDeleted);
  }

  // 🔥 삭제된 게 없으면 에러 처리
  if (totalDeleted === 0) {
    throw new Error("해당 시간에 해제할 예약불가 데이터가 없습니다.");
  }

  return totalDeleted;
};

module.exports = {
  getManagerSchedule,
  createBlockedTimes,
  removeBlockedTimes,
  generateNextMonthSchedules,
};
