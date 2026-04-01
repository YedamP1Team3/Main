import axios from 'axios';

// 담당자 -> 선택한 날짜 근무시간 조회
export const getManagerSchedule = (managerId, date) => {
    return axios.get('/api/reserve/schedule', {
        params: { managerId, date }
    });
};
