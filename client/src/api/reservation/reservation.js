import axios from 'axios';

export const createReservation = (beneId, managerId, date, times) => {
    return axios.post('/api/reserve/', {
        beneId,
        managerId,
        date,
        times
    });
};
