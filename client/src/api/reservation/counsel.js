import axios from 'axios';

export const getManagerCounselList = (managerId) => {
    return axios.get('/api/reserve/manager/counsel', {
        params: { managerId }
    });
};

export const getCounselReservationByRsvId = (rsvId) => {
    return axios.get(`/api/reserve/manager/${rsvId}`);
};

export const createCounselingNote = (payload) => {
    return axios.post('/api/reserve/counsel', payload);
};
