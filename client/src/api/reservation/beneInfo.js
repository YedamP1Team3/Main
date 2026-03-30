import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

export const getBeneficiariesByFamilyId = () => {
    const authStore = useAuthStore();

    return axios.get('/api/reserve/beneficiaries', {
        headers: {
            userId: authStore.userId,
            role: authStore.userRole
        }
    });
};

export const getManagerIdByBene = (beneId) => {
    const authStore = useAuthStore();

    return axios.get('/api/reserve/manager-id', {
        params: {
            beneId: beneId
        },
        headers: {
            userId: authStore.userId,
            role: authStore.userRole
        }
    });
};
