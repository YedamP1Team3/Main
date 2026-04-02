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

export const getCounselingNoteByRsvId = (rsvId) => {
    return axios.get(`/api/reserve/counsel/${rsvId}`);
};

export const updateCounselingNote = (rsvId, payload) => {
    return axios.put(`/api/reserve/counsel/${rsvId}`, payload);
};
