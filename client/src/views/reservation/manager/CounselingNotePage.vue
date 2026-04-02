<template>
    <div class="page">
        <header class="layout-header">
            <JsTopbarmg />
        </header>

        <div class="layout-body">
            <RsvSideBar />

            <main class="layout-main">
                <div class="note-page-container">
                    <CounselingNote v-if="!isLoading" :mode="mode" :reservationInfo="reservationInfo" :initialForm="initialForm" @submit="handleSubmit" @cancel="handleCancel" />

                    <div v-else class="loading-box">상담 정보를 불러오는 중입니다...</div>
                </div>
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { getCounselReservationByRsvId } from '@/api/reservation/counsel';
import { createCounselingNote, getCounselingNoteByRsvId, updateCounselingNote } from '@/api/reservation/counsel';

import JsTopbarmg from '@/layout/manager/JsTopbarmg.vue';
import RsvSideBar from '@/components/reservation/RsvSideBar.vue';
import CounselingNote from '@/components/reservation/CounselingNote.vue';

const route = useRoute();
const router = useRouter();

const isLoading = ref(true);

const mode = computed(() => (route.name === 'editCounselingNote' ? 'edit' : 'create'));

const reservationInfo = ref({
    rsv_id: '',
    family_name: '',
    bene_name: '',
    disability_type: '',
    reservation_date: '',
    reservation_time: '',
    rsv_status: ''
});

const initialForm = ref({
    counselingType: '',
    title: '',
    content: '',
    futurePlan: ''
});

const formatReservationInfo = (item) => {
    const [reservationDate = '', startClockRaw = ''] = (item.start_time || '').split(' ');
    const [, endClockRaw = ''] = (item.end_time || '').split(' ');

    const startClock = startClockRaw.slice(0, 5);
    const endClock = endClockRaw.slice(0, 5);

    return {
        rsv_id: item.rsv_id,
        family_name: item.family_name,
        bene_name: item.bene_name,
        disability_type: item.disability_type,
        reservation_date: reservationDate,
        reservation_time: `${startClock} ~ ${endClock}`,
        rsv_status: item.rsv_status
    };
};

const formatInitialForm = (note) => {
    return {
        counselingType: note.counseling_type || '',
        title: note.title || '',
        content: note.content || '',
        futurePlan: note.future_plan || ''
    };
};

const fetchPageData = async () => {
    try {
        const rsvId = route.query.rsvId;

        if (!rsvId) {
            alert('잘못된 접근입니다.');
            router.push({ name: 'managecounsel' });
            return;
        }
        const reservationRes = await getCounselReservationByRsvId(rsvId);
        reservationInfo.value = formatReservationInfo(reservationRes.data.reservation);

        if (mode.value === 'edit') {
            const noteRes = await getCounselingNoteByRsvId(rsvId);
            initialForm.value = formatInitialForm(noteRes.data.note);
        }
    } catch (err) {
        console.error('상담일지 페이지 조회 실패 : ', err);
        alert(err.response?.data?.message || '상담 정보 조회 실패');
        router.push({ name: 'managecounsel' });
    } finally {
        isLoading.value = false;
    }
};

const handleSubmit = async (formData) => {
    try {
        const payload = {
            rsvId: reservationInfo.value.rsv_id,
            ...formData
        };

        if (mode.value === 'create') {
            await createCounselingNote(payload);
            alert('상담일지가 작성되었습니다.');
        } else {
            await updateCounselingNote(reservationInfo.value.rsv_id, formData);
            alert('상담일지가 수정되었습니다.');
        }
        router.push({ name: 'managecounsel' });
    } catch (err) {
        console.error('상담일지 저장 실패 : ', err);
        alert(err.response?.data?.message || '상담일지 저장 실패');
    }
};

const handleCancel = () => {
    router.push({ name: 'managecounsel' });
};

onMounted(() => {
    fetchPageData();
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

.note-page-container {
    max-width: 1100px;
    margin: 0 auto;
}

.loading-box {
    background: #ffffff;
    border-radius: 16px;
    padding: 40px;
    text-align: center;
    font-size: 16px;
    color: #555;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}
</style>
