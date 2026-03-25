<template>
    <div class="container">
        <Calendar v-model="selectedDate" />

        <TimeSlot :selectedDate="selectedDate" :slots="slots" mode="manager" @blockTimes="handleBlock" />
    </div>
</template>

<script>
import { ref, watch } from 'vue';
import Calendar from '@/components/common/Calendar.vue';
import TimeSlot from '@/components/common/TimeSlot.vue';

import { getManagerSchedule } from '@/api/reservation/schedule';
import { createBlockedTimes, deleteBlockedTimes } from '@/api/reservation/block';

export default {
    components: {
        Calendar,
        TimeSlot
    },

    setup() {
        const selectedDate = ref(null);
        const slots = ref([]);

        // 🔥 날짜 변경 감지 → API 호출
        watch(selectedDate, async (newDate) => {
            if (!newDate) return;

            try {
                const formattedDate = new Date(newDate).toISOString().slice(0, 10);
                const res = await getManagerSchedule(formattedDate);
                console.log('서버 응답:', res.data);
                console.log('slots : ', slots.value);

                // schedule이 배열일 가능성 대비
                const schedule = res.data.schedule;

                if (!schedule) {
                    slots.value = [];
                    return;
                }

                slots.value = convertToSlots(schedule);
            } catch (err) {
                console.error('스케줄 조회 실패:', err);
                slots.value = [];
            }
        });

        // 🔥 근무시간 → 타임슬롯 변환
        const convertToSlots = (schedule) => {
            const result = [];

            let [hour, minute] = schedule.work_start_time.split(':').map(Number);
            const [endHour, endMinute] = schedule.work_end_time.split(':').map(Number);

            while (hour < endHour || (hour === endHour && minute < endMinute)) {
                const time = String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0');

                result.push(time);

                minute += 30;
                if (minute === 60) {
                    hour++;
                    minute = 0;
                }
            }

            return result;
        };

        // 🔥 차단 처리 (아직 API 연결 전 단계)
        const handleBlock = async (data) => {
            console.log('차단 요청:', data);

            try {
                const { date, times, type } = data;

                const payload = {
                    date,
                    times
                };

                console.log('API 요청:', payload);

                // 🔵 예약가능 → 차단 해제
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
            } catch (err) {
                console.error('처리 실패:', err);

                alert(err.response?.data?.message || '처리 실패');
            }
        };

        return {
            selectedDate,
            slots,
            handleBlock
        };
    }
};
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 50px;
    gap: 20px;
}

.selected-date {
    font-size: 16px;
}
</style>
