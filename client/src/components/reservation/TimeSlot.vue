<template>
    <div class="timeslot-container">
        <!-- 선택된 날짜 표시 -->
        <div class="header">
            <h3>시간 선택</h3>
            <p v-if="selectedDate">{{ selectedDate }}</p>
            <p v-else>날짜를 먼저 선택하세요</p>
        </div>

        <!-- 오전 / 오후 선택 -->
        <div class="period-toggle">
            <button :class="{ active: period === 'AM' }" @click="period = 'AM'">오전</button>
            <button :class="{ active: period === 'PM' }" @click="period = 'PM'">오후</button>
        </div>

        <!-- 시간 리스트 -->
        <div class="time-grid">
            <div v-for="time in timeSlots" :key="time" class="time-item" :class="{ selected: selectedTimes.includes(time) }" @click="toggleTime(time)">
                {{ time }}
            </div>
        </div>

        <!-- 버튼 -->
        <div class="action-buttons">
            <button class="available-btn">예약가능</button>
            <button class="unavailable-btn">예약불가</button>
        </div>
    </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import axios from 'axios';

export default {
    name: 'TimeSlot',
    props: {
        selectedDate: String
    },
    setup(props) {
        const period = ref('AM');
        const selectedTimes = ref([]);

        const fetchSchedule = async (date) => {
            let schedule = [];
            try {
                const res = await axios.get('/api/reserve/schedule', {
                    params: { date }
                });

                if (res.data.success) {
                    schedule.value = res.data.schedule;
                    console.log('스케줄 데이터:', schedule.value);
                }
            } catch (err) {
                console.error('스케줄 조회 실패:', err);
            }
        };

        // 날짜 변경 감지
        watch(
            () => props.selectedDate,
            (newDate) => {
                if (!newDate) return;

                selectedTimes.value = []; // 선택 초기화
                fetchSchedule(newDate); // 🔥 API 호출
            }
        );

        // 시간 생성 함수
        const generateTimeSlots = (start, end) => {
            const times = [];
            let [hour, minute] = start.split(':').map(Number);
            const [endHour, endMinute] = end.split(':').map(Number);

            while (hour < endHour || (hour === endHour && minute <= endMinute)) {
                const h = String(hour).padStart(2, '0');
                const m = String(minute).padStart(2, '0');
                times.push(`${h}:${m}`);

                minute += 30;
                if (minute >= 60) {
                    minute = 0;
                    hour += 1;
                }
            }

            return times;
        };

        const timeSlots = computed(() => {
            if (period.value === 'AM') {
                return generateTimeSlots('09:00', '12:30');
            } else {
                return generateTimeSlots('14:00', '17:30');
            }
        });

        const toggleTime = (time) => {
            if (selectedTimes.value.includes(time)) {
                selectedTimes.value = selectedTimes.value.filter((t) => t !== time);
            } else {
                selectedTimes.value.push(time);
            }
        };

        return {
            period,
            timeSlots,
            selectedTimes,
            toggleTime
        };
    }
};
</script>

<style scoped>
.timeslot-container {
    width: 320px;
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

/* 헤더 */
.header {
    margin-bottom: 15px;
}

/* 오전/오후 */
.period-toggle {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
}

.period-toggle button {
    flex: 1;
    padding: 8px;
    border: 1px solid #3b82f6;
    background: white;
    color: #3b82f6;
    border-radius: 8px;
    cursor: pointer;
}

.period-toggle button.active {
    background: #3b82f6;
    color: white;
}

/* 시간 grid */
.time-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
}

.time-item {
    padding: 10px;
    text-align: center;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    cursor: pointer;
    transition: 0.2s;
}

.time-item:hover {
    background: #e6f0ff;
}

.time-item.selected {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
}

/* 버튼 */
.action-buttons {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}

.available-btn {
    flex: 1;
    padding: 10px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
}

.unavailable-btn {
    flex: 1;
    padding: 10px;
    background: white;
    color: #ef4444;
    border: 1px solid #ef4444;
    border-radius: 8px;
    cursor: pointer;
}
</style>
