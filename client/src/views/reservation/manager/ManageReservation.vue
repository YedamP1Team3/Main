<template>
    <div class="page">
        <header class="layout-header">
            <JsTopbarmg />
        </header>

        <div class="layout-body">
            <RsvSideBar />

            <main class="layout-main">
                <div class="reservation-manage-container">
                    <h2 class="page-title">예약 관리</h2>

                    <RsvTable :columns="columns" :rows="reservations" @action-click="handleActionClick" />
                </div>
            </main>
        </div>

        <RsvProcessModal :visible="isProcessModalOpen" :reservation="selectedReservation" @close="closeProcessModal" @confirm="handleProcessConfirm" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import JsTopbarmg from '@/layout/manager/JsTopbarmg.vue';
import RsvSideBar from '@/components/reservation/RsvSideBar.vue';
import RsvTable from '@/components/common/RsvTable.vue';
import RsvProcessModal from '@/components/reservation/RsvProcessModal.vue';

import { useAuthStore } from '@/stores/auth';
import { getManagerReservations, processReservation } from '@/api/reservation/reservation';

const authStore = useAuthStore();
const { userId } = storeToRefs(authStore);

const reservations = ref([]);
const isProcessModalOpen = ref(false);
const selectedReservation = ref(null);

const columns = [
    { key: 'family_name', label: '보호자명' },
    { key: 'bene_name', label: '지원대상자명' },
    { key: 'disability_type', label: '장애유형' },
    { key: 'reservation_date', label: '예약날짜' },
    { key: 'reservation_time', label: '예약시간' },
    { key: 'rsv_status', label: '예약상태', type: 'status' },
    { key: 'process', label: '처리', type: 'action', action: 'process' }
];

const formatReservationRow = (item) => {
    const [reservationDate = '', startClockRaw = ''] = (item.start_time || '').split(' ');
    const [, endClockRaw = ''] = (item.end_time || '').split(' ');

    const startClock = startClockRaw.slice(0, 5);
    const endClock = endClockRaw.slice(0, 5);

    return {
        ...item,
        reservation_date: reservationDate,
        reservation_time: `${startClock} ~ ${endClock}`
    };
};

const fetchReservations = async () => {
    try {
        if (!userId.value) return;

        const res = await getManagerReservations(userId.value);
        const list = res.data.reservations || [];

        const visibleStatuses = ['APPROVED', 'REJECTED', 'REQUESTED'];

        reservations.value = list.filter((item) => visibleStatuses.includes(item.rsv_status)).map(formatReservationRow);
    } catch (err) {
        console.error('담당자 예약 목록 조회 실패:', err);
        alert(err.response?.data?.message || '예약 목록 조회 실패');
    }
};

const openProcessModal = (row) => {
    selectedReservation.value = row;
    isProcessModalOpen.value = true;
};

const closeProcessModal = () => {
    isProcessModalOpen.value = false;
    selectedReservation.value = null;
};

const handleProcessConfirm = async ({ rsvId, decision, rejectReason }) => {
    try {
        await processReservation(rsvId, decision, rejectReason);

        alert(decision === 'APPROVED' ? '예약이 승인되었습니다.' : '예약이 반려되었습니다.');

        closeProcessModal();
        await fetchReservations();
    } catch (err) {
        console.error('예약 처리 실패:', err);
        alert(err.response?.data?.message || '예약 처리 실패');
    }
};

const handleActionClick = ({ action, row }) => {
    if (action === 'process') {
        openProcessModal(row);
        return;
    }
};

onMounted(() => {
    fetchReservations();
});
</script>

<style scoped>
.page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #fef9f6;
}

.layout-header {
    height: 70px;
    flex-shrink: 0;
    background-color: #fff;
    border-bottom: 1px solid #f4e2de;
}

.layout-body {
    display: flex;
    flex: 1;
    min-height: 0;
}

.layout-main {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    background-color: #fef9f6;
}

.reservation-manage-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.page-title {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
}
</style>
