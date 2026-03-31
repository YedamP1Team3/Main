<script>
import { ref, watch } from 'vue';
import Calendar from '@/components/common/Calendar.vue';
import TimeSlot from '@/components/common/TimeSlot.vue';
import JsTopbarmg from '@/layout/manger/JsTopbarmg.vue';
import RsvSideBar from '@/components/reservation/RsvSideBar.vue';

import { getManagerSchedule } from '@/api/reservation/schedule';
import { createBlockedTimes, deleteBlockedTimes } from '@/api/reservation/block';

import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';

export default {
    components: {
        Calendar,
        TimeSlot,
        JsTopbarmg,
        RsvSideBar
    },

    setup() {
        const authStore = useAuthStore();
        const { userId } = storeToRefs(authStore);

        const selectedDate = ref(null);
        const slots = ref([]);
        const blockedSummary = ref([]);

        const managerId = userId;

        const extractBlockedSummary = (schedule) => {
            const summary = schedule.blocked_summary || [];

            return summary.map((item) => {
                return `${item.start_time} ~ ${item.end_time}`;
            });
        };

        // 🔥 날짜 변경 감지 → API 호출
        watch(selectedDate, async (newDate) => {
            if (!newDate) return;

            try {
                const formattedDate = new Date(newDate).toISOString().slice(0, 10);
                const res = await getManagerSchedule(managerId.value, formattedDate);

                // schedule이 배열일 가능성 대비
                const schedule = res.data.schedule;

                if (!schedule) {
                    slots.value = [];
                    blockedSummary.value = [];
                    return;
                }

                console.log('res.data.schedule : ', schedule);
                slots.value = convertToSlots(schedule);
                blockedSummary.value = extractBlockedSummary(schedule);
                console.log('schedule : ', slots.value);
            } catch (err) {
                console.error('스케줄 조회 실패:', err);
                slots.value = [];
                blockedSummary.value = [];
            }
        });

        // 🔥 근무시간 → 타임슬롯 변환
        const convertToSlots = (schedule) => {
            const result = [];
            const reserved = schedule.reserved_times || [];
            const blocked = schedule.blocked_times || [];

            const isReserved = (time) => {
                return reserved.some((r) => {
                    const start = r.start_time.slice(11, 16); // "10:30"
                    const end = r.end_time.slice(11, 16); // "11:00"

                    return time >= start && time < end;
                });
            };

            const isBlocked = (time) => {
                return blocked.some((b) => {
                    const start = b.start_time.slice(11, 16); // "13:00"
                    const end = b.end_time.slice(11, 16); // "14:00"

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

        // 차단 처리
        const handleBlock = async (data) => {
            try {
                const { date, times, type } = data;

                const payload = {
                    managerId: managerId.value,
                    date,
                    times
                };

                if (type === 'available') {
                    await deleteBlockedTimes(payload);
                    alert('예약가능으로 변경되었습니다.');
                } else if (type === 'unavailable') {
                    await createBlockedTimes(payload);
                    alert('차단시간이 등록되었습니다.');
                }
                console.log('payload : ', payload);
                console.log('data : ', data);

                const res = await getManagerSchedule(managerId.value, date);
                const schedule = res.data.schedule;

                if (!schedule) {
                    slots.value = [];
                    blockedSummary.value = [];
                    return;
                }

                slots.value = convertToSlots(schedule);
                blockedSummary.value = extractBlockedSummary(schedule);
            } catch (err) {
                console.error('처리 실패:', err);
                alert(err.response?.data?.message || '처리 실패');
            }
        };

        return {
            selectedDate,
            slots,
            blockedSummary,
            handleBlock
        };
    }
};
</script>

<template>
    <div calss="page">
        <header class="layout-header">
            <JsTopbarmg />
        </header>
        <div class="layout-body">
            <RsvSideBar />
            <main class="layout-main">
                <div class="content row">
                    <Calendar v-model="selectedDate" />
                    <TimeSlot :selectedDate="selectedDate" :slots="slots" :blockedSummary="blockedSummary" mode="manager" @blockTimes="handleBlock" />
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
    .content.row {
        flex-direction: column;
        align-items: center;
    }
}
</style>
