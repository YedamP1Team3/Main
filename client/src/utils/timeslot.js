export const toggleTimeHandler = (slot, selectedTimes, mode) => {
    if (slot.status === 'reserved') {
        return selectedTimes;
    }

    if (slot.status === 'blocked' && mode !== 'manager') {
        return selectedTimes;
    }

    if (selectedTimes.includes(slot.time)) {
        return selectedTimes.filter((time) => time !== slot.time);
    }

    return [...selectedTimes, slot.time];
};
