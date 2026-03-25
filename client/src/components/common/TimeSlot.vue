<template>
    <div class="timeslot-container">
        <!-- 헤더 -->
        <div class="header">
            <h3>시간 선택</h3>
            <p v-if="selectedDate">{{ selectedDate }}</p>
            <p v-else>날짜를 먼저 선택하세요</p>
        </div>

        <!-- 오전 / 오후 토글 -->
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

        <!-- 액션 버튼 -->
        <div class="action-buttons">
            <!-- 담당자 모드 -->
            <template v-if="mode === 'manager'">
                <button class="available-btn" @click="handleManagerAction('available')">예약가능</button>
                <button class="unavailable-btn" @click="handleManagerAction('unavailable')">예약불가</button>
            </template>

            <!-- 보호자 모드 -->
            <template v-else>
                <button class="available-btn" @click="handleUserAction">상담신청</button>
                <button class="unavailable-btn" @click="$emit('cancelSelection')">취소</button>
            </template>
        </div>
    </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
    name: 'TimeSlot',

    props: {
        selectedDate: String,
        slots: {
            type: Array,
            default: () => []
        },
        mode: {
            type: String,
            default: 'user'
        }
    },

    emits: ['blockTimes', 'reserveTimes'],

    setup(props, { emit }) {
        const period = ref('AM');
        const selectedTimes = ref([]);

        const timeSlots = computed(() => {
            if (!props.slots.length) return [];

            return props.slots.filter((t) => (period.value === 'AM' ? t < '13:00' : t >= '14:00'));
        });

        const toggleTime = (time) => {
            if (selectedTimes.value.includes(time)) {
                selectedTimes.value = selectedTimes.value.filter((t) => t !== time);
            } else {
                selectedTimes.value.push(time);
            }
        };

        const handleManagerAction = (type) => {
            if (!props.selectedDate || selectedTimes.value.length === 0) {
                alert('날짜와 시간을 선택하세요.');
                return;
            }

            emit('blockTimes', {
                date: props.selectedDate,
                times: selectedTimes.value,
                type // 'available' | 'unavailable'
            });

            selectedTimes.value = [];
        };

        const handleUserAction = () => {
            if (!props.selectedDate || selectedTimes.value.length === 0) {
                alert('날짜와 시간을 선택하세요.');
                return;
            }

            emit('reserveTimes', {
                date: props.selectedDate,
                times: selectedTimes.value
            });

            selectedTimes.value = [];
        };

        return {
            period,
            timeSlots,
            selectedTimes,
            toggleTime,
            handleManagerAction,
            handleUserAction
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
