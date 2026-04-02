<template>
    <div class="page">
        <header class="layout-header">
            <JsTopbarmg />
        </header>

        <div class="layout-body">
            <RsvSideBar />

            <main class="layout-main">
                <div class="counsel-manage-container">
                    <h2 class="page-title">상담일지 관리</h2>

                    <RsvTable :columns="columns" :rows="counsels" @action-click="handleActionClick" />
                </div>
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth';
import { getManagerCounselList } from '@/api/counsel/counsel';

import JsTopbarmg from '@/layout/manager/JsTopbarmg.vue';
import RsvSideBar from '@/components/reservation/RsvSideBar.vue';
import RsvTable from '@/components/common/RsvTable.vue';

const authStore = useAuthStore();
const { userId } = storeToRefs(authStore);
const router = useRouter();

const counsels = ref([]);

const columns = [
    { key: 'family_name', label: '보호자명' },
    { key: 'bene_name', label: '지원대상자명' },
    { key: 'disability_type', label: '장애유형' },
    { key: 'reservation_date', label: '예약날짜' },
    { key: 'reservation_time', label: '예약시간' },
    { key: 'rsv_status', label: '예약상태', type: 'status' },
    { key: 'write_log', label: '일지작성', type: 'action', action: 'writeLog' }
];

const formatCounselRow = (item) => {
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

const fetchCounsels = async () => {
    try {
        if (!userId.value) return;

        const res = await getManagerCounselList(userId.value);
        const list = res.data.counsels || [];

        counsels.value = list.map(formatCounselRow);
    } catch (err) {
        console.error('상담일지 관리 목록 조회 실패:', err);
        alert(err.response?.data?.message || '상담일지 관리 목록 조회 실패');
    }
};

const handleActionClick = ({ action, row }) => {
    if (action !== 'writeLog') return;

    if (row.rsv_status === 'COMPLETED') {
        console.log('상담일지 작성 이동:', row.rsv_id);

        router.push({
            name: 'createCounselingNote',
            params: { rsvId: row.rsv_id }
        });
        return;
    }

    if (row.rsv_status === 'NOTE_WRITTEN') {
        console.log('상담일지 수정 이동:', row.rsv_id);

        router.push({
            name: 'editCounselingNote',
            params: { rsvId: row.rsv_id }
        });
    }
};

onMounted(() => {
    fetchCounsels();
});
</script>

<style scoped>
.page {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.layout-header {
    height: 70px;
    flex-shrink: 0;
}

.layout-body {
    display: flex;
    flex: 1;
}

.layout-main {
    flex: 1;
    padding: 24px;
    background-color: #f8f9fb;
    overflow-y: auto;
}

.counsel-manage-container {
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.page-title {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 20px;
}
</style>
