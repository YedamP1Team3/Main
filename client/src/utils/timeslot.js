export const toggleTimeHandler = (slot, selectedTimes, mode) => {
    const time = slot.time;

    // 🔥 보호자 모드 → blocked 클릭 금지
    if (mode !== 'manager' && slot.status === 'blocked') {
        return selectedTimes;
    }

    // 선택 토글
    if (selectedTimes.includes(time)) {
        return selectedTimes.filter((t) => t !== time);
    } else {
        return [...selectedTimes, time];
    }
};
