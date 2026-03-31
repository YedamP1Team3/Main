import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

// 예약 생성
export const createReservation = (beneId, managerId, date, times) => {
    return axios.post('/api/reserve/', {
        beneId,
        managerId,
        date,
        times
    });
};

// 보호자 전체 지원대상자 상담 신청 내역 조회
export const getFamilyReservations = () => {
    const authStore = useAuthStore();

    return axios.get('/api/reserve/reservations', {
        headers: {
            userId: authStore.userId,
            role: authStore.userRole
        }
    });
};

// 상담 신청 취소(삭제)
export const cancelReservation = (rsvId) => {
    return axios.delete(`/api/reserve/reservations/${rsvId}`);
};
