<template>
    <header class="layout-header">
        <MTopbar />
    </header>
    <div class="layout-body">
        <RsvSideBar />
        <main class="layout-main">
            <div class="reservation_container">
                <BeneInfo :beneficiaries="beneficiaries" :selectedBeneId="selectedBeneId" @select-beneficiary="handleSelectBeneficiary" />
                <div class="content row">
                    <Calendar v-model="selectedDate" />
                    <TimeSlot :selectedDate="selectedDate" :slots="slots" mode="family" @reserveTimes="handleReserve" />
                </div>
            </div>
        </main>
    </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue';
import Calendar from '@/components/common/Calendar.vue';
import TimeSlot from '@/components/common/TimeSlot.vue';

import { getManagerSchedule } from '@/api/reservation/schedule';
// import { createBlockedTimes, deleteBlockedTimes } from '@/api/reservation/block';
import { getBeneficiariesByFamilyId, getManagerIdByBene } from '@/api/reservation/beneInfo';

import RsvSideBar from '@/components/reservation/RsvSideBar.vue';
import MTopbar from '@/layout/member/mTopbar.vue';
import BeneInfo from '@/components/reservation/beneInfo.vue';

export default {
    components: {
        Calendar,
        TimeSlot,
        MTopbar,
        RsvSideBar,
        BeneInfo
    },

    setup() {
        const selectedBene = ref(null);
        const selectedBeneId = ref(null);
        const beneficiaries = ref([]);
        const managerId = ref(null);

        const selectedDate = ref(null);
        const slots = ref([]);
        const blockedSummary = ref([]);

        onMounted(async () => {
            try {
                const res = await getBeneficiariesByFamilyId();
                console.log('전체 응답 : ', res);
                beneficiaries.value = res.data.data || [];
            } catch (err) {
                console.error('지원대상자 목록 조회 실패:', err);
                beneficiaries.value = [];
            }
        });

        const handleSelectBeneficiary = async (bene) => {
            selectedBene.value = bene;
            selectedBeneId.value = bene?.bene_id || null;

            // 초기화
            selectedDate.value = null;
            slots.value = [];

            // ❗ 선택 안 된 경우 방어
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

        // 🔥 날짜 변경 감지 → API 호출
        watch([selectedDate, selectedBeneId], async ([date, beneId]) => {
            if (!date || !beneId || !managerId.value) return;

            try {
                const formattedDate = new Date(date).toISOString().slice(0, 10);

                const res = await getManagerSchedule(formattedDate, managerId.value);

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

        // 🔥 근무시간 → 타임슬롯 변환
        const convertToSlots = (schedule) => {
            const result = [];
            const occupied = schedule.occupied_times || [];

            const isBlocked = (time) => {
                return occupied.some((o) => {
                    const start = o.start_time.slice(11, 16); // "09:00"
                    const end = o.end_time.slice(11, 16); // "10:00"

                    return time >= start && time < end;
                });
            };

            let [hour, minute] = schedule.work_start_time.split(':').map(Number);
            const [endHour, endMinute] = schedule.work_end_time.split(':').map(Number);

            while (hour < endHour || (hour === endHour && minute < endMinute)) {
                const time = String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0');

                result.push({
                    time,
                    status: isBlocked(time) ? 'blocked' : 'available'
                });

                minute += 30;
                if (minute === 60) {
                    hour++;
                    minute = 0;
                }
            }

            return result;
        };

        const handleReserve = async (data) => {
            console.log('예약 요청: ', data);

            try {
                const payload = {
                    beneId: selectedBeneId.value,
                    date: data.date,
                    times: data.times
                };

                await createReservation(payload);

                alert('상담 신청 완료');
            } catch (err) {
                console.error(err);
                alert('예약 실패');
            }
        };

        // 차단 처리
        const handleBlock = async (data) => {
            console.log('차단 요청:', data);

            try {
                const { date, times, type } = data;

                const payload = {
                    date,
                    times
                };

                console.log('API 요청:', payload);

                // 예약가능 → 차단 해제
                if (type === 'available') {
                    await deleteBlockedTimes(payload);

                    alert('예약가능으로 변경되었습니다.');
                }

                // 🔴 예약불가 → 차단 등록
                else if (type === 'unavailable') {
                    await createBlockedTimes(payload);

                    alert('차단시간이 등록되었습니다.');
                }

                // 🔥 UI 갱신 (공통)
                const res = await getManagerSchedule(date);
                const raw = res.data.schedule;
                const schedule = Array.isArray(raw) ? raw[0] : raw;

                slots.value = convertToSlots(schedule);
                blockedSummary.value = extractBlockedSummary(schedule);
            } catch (err) {
                console.error('처리 실패:', err);

                alert(err.response?.data?.message || '처리 실패');
            }
        };

        return {
            selectedBeneId,
            beneficiaries,
            selectedDate,
            slots,
            blockedSummary,
            handleBlock,
            handleSelectBeneficiary,
            handleReserve
        };
    }
};
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
    flex: 1; /* 남은 공간 자동 */
}

.layout-sidebar {
    width: 250px; /* 사이드바 너비 고정 */
    flex-shrink: 0; /* 너비가 줄어들지 않도록 설정 */
    border-right: 1px solid #ccc; /* 구분선 */
}

.layout-main {
    flex: 1;
    background-color: #f9f9f9;

    display: flex;
    justify-content: center;
    align-items: flex-start;

    padding-top: 40px;
    overflow-y: auto;
}

.reservation-container {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;

    display: flex;
    flex-direction: column;
    gap: 28px;
}

.content.row {
    display: flex;
    flex-direction: row; /* 🔥 핵심 */
    justify-content: center;
    align-items: flex-start;

    gap: 30px; /* 컴포넌트 사이 간격 */
    width: 100%;
    max-width: 800px; /* 🔥 전체 레이아웃 폭 */
}

.selected-date {
    font-size: 16px;
}

@media (max-width: 1100px) {
    .content-row {
        flex-direction: column;
    }
}
</style>
