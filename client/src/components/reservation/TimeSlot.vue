<template>
    <div class="timeslot-container">
        <div class="timeslot-card">
            <!-- 날짜 표시 -->
            <h3 v-if="selectedDate" class="date-title">
                {{ formattedDate }}
            </h3>
            <div v-else class="empty-message">날짜를 선택해주세요</div>

            <!-- 오전 / 오후 -->
            <div v-if="selectedDate" class="period-selector">
                <button :class="['period-btn', { active: selectedPeriod === 'AM' }]" @click="selectPeriod('AM')">오전</button>
                <button :class="['period-btn', { active: selectedPeriod === 'PM' }]" @click="selectPeriod('PM')">오후</button>
            </div>

            <!-- 시간 슬롯 -->
            <div v-if="selectedDate" class="slots">
                <button
                    v-for="time in timeSlots"
                    :key="time"
                    class="slot-btn"
                    :class="{
                        selected: selectedTime === time,
                        disabled: !isAvailable(time)
                    }"
                    @click="selectTime(time)"
                >
                    {{ time }}
                </button>
            </div>
            <!-- 상태 변경 버튼 -->
            <div v-if="selectedTime" class="action-buttons">
                <button class="available-btn" @click="setAvailable">예약가능</button>
                <button class="unavailable-btn" @click="setUnavailable">예약불가</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    selectedDate: Date
});

const selectedPeriod = ref('AM');
const selectedTime = ref(null);

// 🔹 날짜 포맷
const formattedDate = computed(() => {
    return props.selectedDate ? props.selectedDate.toISOString().split('T')[0] : '';
});

// 🔹 오전/오후 선택
const selectPeriod = (period) => {
    selectedPeriod.value = period;
    selectedTime.value = null; // 선택 초기화
};

// 🔹 시간 생성
const generateTimeSlots = (start, end) => {
    const result = [];
    for (let h = start; h <= end; h++) {
        result.push(`${String(h).padStart(2, '0')}:00`);
        result.push(`${String(h).padStart(2, '0')}:30`);
    }
    return result;
};

// 🔹 슬롯 계산
const timeSlots = computed(() => {
    return selectedPeriod.value === 'AM' ? generateTimeSlots(9, 12) : generateTimeSlots(14, 17);
});

// 🔹 (임시) 전부 가능 상태
const isAvailable = (time) => {
    return true;
};

// 🔹 시간 선택
const selectTime = (time) => {
    if (!isAvailable(time)) return;

    selectedTime.value = time;

    const dateStr = props.selectedDate.toISOString().split('T')[0];
    const datetime = `${dateStr} ${time}:00`;

    console.log('선택된 DATETIME:', datetime);
};

// 예약가능
const setAvailable = () => {
    if (!props.selectedDate || !selectedTime.value) return;

    const dateStr = props.selectedDate.toISOString().split('T')[0];
    const datetime = `${dateStr} ${selectedTime.value}:00`;

    console.log('예약가능 처리:', datetime);

    // 👉 여기서 API 호출 예정
};

// 예약불가
const setUnavailable = () => {
    if (!props.selectedDate || !selectedTime.value) return;

    const dateStr = props.selectedDate.toISOString().split('T')[0];
    const datetime = `${dateStr} ${selectedTime.value}:00`;

    console.log('예약불가 처리:', datetime);

    // 👉 여기서 API 호출 예정
};
</script>

<style scoped>
/* 전체 배경 */
.timeslot-container {
    background: #f4f8ff;
    padding: 20px;
    border-radius: 16px;
}

/* 카드 */
.timeslot-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 날짜 */
.date-title {
    margin-bottom: 10px;
    font-weight: bold;
}

/* 안내문 */
.empty-message {
    color: #888;
    text-align: center;
}

/* 오전/오후 */
.period-selector {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
}

.period-btn {
    flex: 1;
    padding: 10px;
    border-radius: 10px;
    border: none;
    background: #e3ecff;
    cursor: pointer;
    transition: 0.2s;
}

.period-btn:hover {
    background: #cddcff;
}

.period-btn.active {
    background: #4a90e2;
    color: white;
    font-weight: bold;
}

/* 슬롯 */
.slots {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
}

/* 버튼 */
.slot-btn {
    padding: 10px;
    border-radius: 10px;
    border: none;
    background: #eef4ff;
    cursor: pointer;
    transition: 0.2s;
}

/* hover */
.slot-btn:hover {
    background: #dbe7ff;
}

/* 선택됨 */
.slot-btn.selected {
    background: #4a90e2;
    color: white;
    font-weight: bold;
}

/* 비활성 */
.slot-btn.disabled {
    background: #eee;
    color: #aaa;
    cursor: not-allowed;
}

/* 버튼 영역 */
.action-buttons {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}

/* 공통 버튼 */
.action-buttons button {
    flex: 1;
    padding: 12px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    transition: 0.2s;
    font-weight: bold;
}

/* 예약가능 */
.available-btn {
    background: #4a90e2;
    color: white;
}

.available-btn:hover {
    background: #357bd8;
}

/* 예약불가 */
.unavailable-btn {
    background: #eee;
    color: #555;
}

.unavailable-btn:hover {
    background: #ddd;
}
</style>
