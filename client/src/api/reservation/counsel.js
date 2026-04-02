import axios from 'axios';

export const getManagerCounselList = (managerId) => {
    return axios.get('/api/reserve/counsel', {
        params: { managerId }
    });
};
