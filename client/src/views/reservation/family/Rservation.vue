<script>
import { ref, watch, onMounted } from 'vue';
import Calendar from '@/components/common/Calendar.vue';
import TimeSlot from '@/components/common/TimeSlot.vue';
import MTopbar from '@/layout/member/mTopbar.vue';
import BeneInfo from '@/components/reservation/beneInfo.vue';
import RsvTable from '@/components/common/RsvTable.vue';
import RejectionReasonModal from '@/components/reservation/RejectionReasonModal.vue';

import { getManagerSchedule } from '@/api/reservation/schedule';
import { getBeneficiariesByFamilyId, getManagerIdByBene } from '@/api/reservation/beneInfo';
import { createReservation, getFamilyReservations, cancelReservation } from '@/api/reservation/reservation';
export default {
    components: {
        Calendar,
        TimeSlot,
        MTopbar,
        BeneInfo,
        RsvTable,
        RejectionReasonModal
    },

    setup() {
        const selectedBene = ref(null);
        const selectedBeneId = ref(null);
        const beneficiaries = ref([]);
        const managerId = ref(null);

        const selectedDate = ref(null);
        const slots = ref([]);
        const blockedSummary = ref([]);

        const reservationRows = ref([]);

        const isRejectReasonModalOpen = ref(false);
        const selectedRejectReservation = ref(null);

        const reservationColumns = [
            { key: 'bene_name', label: '지원대상자명', type: 'text' },
            { key: 'disability_type', label: '장애유형', type: 'text' },
            { key: 'start_time', label: '예약날짜', type: 'date' },
            { key: 'start_time', label: '예약시간', type: 'timeRange', endKey: 'end_time' },
            { key: 'rsv_status', label: '예약상태', type: 'status' },
            { key: 'view_reject_reason', label: '반려사유', type: 'action', action: 'viewRejectReason' },
            { key: 'cancel_action', label: '취소', type: 'action', action: 'cancel' }
        ];

        const fetchReservationList = async () => {
            try {
                const res = await getFamilyReservations();
                reservationRows.value = res.data.data || [];
            } catch (err) {
                console.error('전체 상담 신청 내역 조회 실패:', err);
                reservationRows.value = [];
            }
        };

        onMounted(async () => {
            try {
                const res = await getBeneficiariesByFamilyId();
                console.log('전체 응답 : ', res);
                beneficiaries.value = res.data.data || [];
            } catch (err) {
                console.error('지원대상자 목록 조회 실패:', err);
                beneficiaries.value = [];
            }

            await fetchReservationList();
        });

        const handleSelectBeneficiary = async (bene) => {
            selectedBene.value = bene;
            selectedBeneId.value = bene?.bene_id || null;

            selectedDate.value = null;
            slots.value = [];
            blockedSummary.value = [];

            if (!bene?.bene_id) {
                managerId.value = null;
                return;
            }

            try {
                const res = await getManagerIdByBene(bene.bene_id);

                if (res.data.success) {
                    managerId.value = res.data.managerId;
                    console.log('담당자 ID:', managerId.value);
                } else {
                    console.warn('managerId 조회 실패');
                    managerId.value = null;
                }
            } catch (err) {
                console.error('managerId 조회 에러:', err);
                managerId.value = null;
            }
        };

        const extractBlockedSummary = (schedule) => {
            const occupied = schedule.occupied_times || [];

            return occupied.map((item) => {
                const start = item.start_time.slice(11, 16);
                const end = item.end_time.slice(11, 16);

                return `${start} ~ ${end}`;
            });
        };

        watch([selectedDate, selectedBeneId], async ([date, beneId]) => {
            if (!date || !beneId || !managerId.value) return;

            try {
                const formattedDate = new Date(date).toISOString().slice(0, 10);

                const res = await getManagerSchedule(managerId.value, formattedDate);
                const schedule = res.data.schedule;

                if (!schedule) {
                    slots.value = [];
                    blockedSummary.value = [];
                    return;
                }

                slots.value = convertToSlots(schedule);
                blockedSummary.value = extractBlockedSummary(schedule);
            } catch (err) {
                console.error('스케줄 조회 실패:', err);
                slots.value = [];
                blockedSummary.value = [];
            }
        });

        const convertToSlots = (schedule) => {
            const result = [];
            const reserved = schedule.reserved_times || [];
            const blocked = schedule.blocked_times || [];

            const isReserved = (time) => {
                return reserved.some((r) => {
                    const start = r.start_time.slice(11, 16);
                    const end = r.end_time.slice(11, 16);

                    return time >= start && time < end;
                });
            };

            const isBlocked = (time) => {
                return blocked.some((b) => {
                    const start = b.start_time.slice(11, 16);
                    const end = b.end_time.slice(11, 16);

                    return time >= start && time < end;
                });
            };

            let [hour, minute] = schedule.work_start_time.split(':').map(Number);
            const [endHour, endMinute] = schedule.work_end_time.split(':').map(Number);

            while (hour < endHour || (hour === endHour && minute < endMinute)) {
                const time = String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0');

                let status = 'available';

                if (isReserved(time)) {
                    status = 'reserved';
                } else if (isBlocked(time)) {
                    status = 'blocked';
                }

                result.push({
                    time,
                    status
                });

                minute += 30;
                if (minute === 60) {
                    hour += 1;
                    minute = 0;
                }
            }

            return result;
        };

        const refreshSchedule = async () => {
            if (!selectedDate.value || !selectedBeneId.value || !managerId.value) return;

            try {
                const formattedDate = new Date(selectedDate.value).toISOString().slice(0, 10);

                const res = await getManagerSchedule(managerId.value, formattedDate);
                const schedule = res.data.schedule;

                if (!schedule) {
                    slots.value = [];
                    blockedSummary.value = [];
                    return;
                }

                slots.value = convertToSlots(schedule);
                blockedSummary.value = extractBlockedSummary(schedule);
            } catch (err) {
                console.error('스케줄 새로고침 실패:', err);
            }
        };

        const handleReserve = async ({ date, times }) => {
            try {
                const res = await createReservation(selectedBeneId.value, managerId.value, date, times);

                alert(res.data.message || '상담 신청 완료');

                await refreshSchedule();
                await fetchReservationList();
            } catch (err) {
                console.error('상담 신청 실패:', err);
                alert(err.response?.data?.message || '상담 신청 실패');
            }
        };

        const openRejectReasonModal = (row) => {
            if (row.rsv_status !== 'REJECTED') {
                alert('반려된 예약만 반려사유를 조회할 수 있습니다.');
                return;
            }

            selectedRejectReservation.value = row;
            isRejectReasonModalOpen.value = true;
        };

        const closeRejectReasonModal = () => {
            isRejectReasonModalOpen.value = false;
            selectedRejectReservation.value = null;
        };

        const handleTableActionClick = async ({ action, row }) => {
            if (action === 'viewRejectReason') {
                openRejectReasonModal(row);
                return;
            }

            if (action !== 'cancel') return;

            if (!confirm('해당 상담 신청을 취소하시겠습니까?')) return;

            try {
                const res = await cancelReservation(row.rsv_id);

                alert(res.data.message || '상담 신청이 취소되었습니다.');

                await fetchReservationList();
                await refreshSchedule();
            } catch (err) {
                console.error('상담 신청 취소 실패:', err);
                alert(err.response?.data?.message || '상담 신청 취소 실패');
            }
        };

        return {
            selectedBene,
            selectedBeneId,
            beneficiaries,
            managerId,
            selectedDate,
            slots,
            blockedSummary,
            isRejectReasonModalOpen,
            selectedRejectReservation,
            reservationRows,
            reservationColumns,
            handleSelectBeneficiary,
            handleReserve,
            openRejectReasonModal,
            closeRejectReasonModal,
            handleTableActionClick
        };
    }
};
</script>

<template>
    <div class="page">
        <header class="layout-header">
            <MTopbar />
        </header>
        <div class="layout-body">
            <BeneInfo :beneficiaries="beneficiaries" :selectedBeneId="selectedBeneId" @select-beneficiary="handleSelectBeneficiary" />
            <main class="layout-main">
                <div class="reservation-container">
                    <div class="content-row">
                        <Calendar v-model="selectedDate" />
                        <TimeSlot :selectedDate="selectedDate" :slots="slots" mode="family" @reserveTimes="handleReserve" />
                    </div>
                    <div class="table-container">
                        <h2 class="page-title">예약 관리</h2>
                        <RsvTable :columns="reservationColumns" :rows="reservationRows" rowKey="rsv_id" emptyMessage="상담 신청 내역이 없습니다." @action-click="handleTableActionClick" />
                    </div>
                    <RejectionReasonModal :visible="isRejectReasonModalOpen" :reservation="selectedRejectReservation" @close="closeRejectReasonModal" />
                </div>
            </main>
        </div>
    </div>
</template>

<style scoped>
.page {
    display: flex;
    flex-direction: column;
    height: 100vh;
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
    background-color: #fef9f6;
}

.layout-main {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 40px 32px 32px;
    overflow-y: auto;
    box-sizing: border-box;
    background-color: #fef9f6;
}

.reservation-container {
    width: 100%;
    max-width: 1060px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 28px;
    background-color: transparent;
}

.content-row {
    display: flex;
    align-items: flex-start;
    gap: 44px;
    width: 100%;
    max-width: 1060px;
}

.content-row > :first-child {
    flex: 0 0 340px;
}

.content-row > :last-child {
    flex: 0 1 720px;
    min-width: 0;
}

.table-container {
    width: 100%;
    max-width: 1060px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
    box-sizing: border-box;
}

.page-title {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
}

@media (max-width: 1060px) {
    .content-row {
        flex-direction: column;
        gap: 24px;
        max-width: 100%;
    }

    .content-row > :first-child,
    .content-row > :last-child {
        flex: none;
        width: 100%;
    }
}
</style>
