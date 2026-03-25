const rsvMapper = require("../database/mappers/rsv_mapper.js");

// 담당자 조회
const getManagerSchedule = async (managerId, date) => {
  let schedule = await rsvMapper.selectManagerSchedule(managerId, date);

  // 데이터 없을 경우 처리 (선택)
  if (!schedule) {
    return null;
  }

  return schedule;
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

module.exports = { getManagerSchedule, createBlockedTimes };
