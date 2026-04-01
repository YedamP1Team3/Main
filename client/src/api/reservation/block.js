import axios from 'axios';

// 담당자 -> 상담불가 시간 추가기능
export const createBlockedTimes = (data) => {
    return axios.post('/api/reserve/blocked-times', data);
};

// 담당자 -> 상담불가 시간 해제기능
export const deleteBlockedTimes = (data) => {
    return axios.delete('/api/reserve/unblock-times', { data });
};
