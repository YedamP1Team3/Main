<template>
    <div class="timeslot-container">
        <div class="timeslot-card">
            <!-- 날짜 표시 -->
            <h3 v-if="selectedDate" class="date-title">
                {{ formattedDate }}
            </h3>
            <div v-else class="empty-message">날짜를 선택해주세요</div>

            <!-- 오전 / 오후 선택 -->
            <div v-if="selectedDate" class="period-selector">
                <button :class="['period-btn', { active: selectedPeriod === 'AM' }]" @click="selectPeriod('AM')">오전</button>

                <button :class="['period-btn', { active: selectedPeriod === 'PM' }]" @click="selectPeriod('PM')">오후</button>
            </div>

            <!-- 시간 슬롯 -->
            <div v-if="selectedDate" class="slots">
                <button
                    v-for="slot in filteredSlots"
                    :key="slot.slot_id"
                    class="slot-btn"
                    :class="{
                        selected: selectedSlot?.slot_id === slot.slot_id,
                        disabled: slot.available === 'BLOCKED'
                    }"
                    @click="selectSlot(slot)"
                >
                    {{ formatTime(slot.slot_datetime) }}
                </button>
            </div>

            <!-- 상태 변경 버튼 -->
            <div v-if="selectedSlot" class="action-buttons">
                <button class="available-btn" @click="setAvailable">예약가능</button>

                <button class="unavailable-btn" @click="blockSlot">예약불가</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import axios from 'axios';

const props = defineProps({
    selectedDate: Date
});

const selectedPeriod = ref('AM');
const selectedSlot = ref(null);
const slots = ref([]);

// 📌 날짜 포맷 (YYYY-MM-DD)
const formattedDate = computed(() => {
    if (!props.selectedDate) return '';

    const year = props.selectedDate.getFullYear();
    const month = String(props.selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(props.selectedDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
});

const findSlotDateTime = async () => {
    if (!formattedDate.value) return;

    try {
        let response = await axios.get(`/api/reserve/schedule`, {
            params: { date: formattedDate.value }
        });
        if (response.data.schedule) {
            slots.value = response.data.schedule;
        } else {
            console.error('슬롯 조회 실패');
        }
    } catch (err) {
        console.error('슬롯 조회 에러:', err);
    }
};

// 📌 날짜 변경 감지 → 슬롯 조회
watch(
    () => props.selectedDate,
    () => {
        selectedSlot.value = null; // 선택 초기화
        findSlotDateTime();
    },
    { immediate: true }
);

// 🔹 오전/오후 선택
const selectPeriod = (period) => {
    selectedPeriod.value = period;
    selectedSlot.value = null;
};

// 🔹 시간 필터링 (AM / PM)
const filteredSlots = computed(() => {
    return slots.value.filter((slot) => {
        const hour = new Date(slot.slot_datetime).getHours();
        return selectedPeriod.value === 'AM' ? hour < 13 : hour >= 14;
    });
});

// 🔹 시간 포맷
const formatTime = (datetime) => {
    return new Date(datetime).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

// 🔹 슬롯 선택
const selectSlot = (slot) => {
    if (slot.status === 'BLOCKED') return;
    selectedSlot.value = slot;
};

// 🔹 예약가능
const setAvailable = async () => {
    if (!selectedSlot.value) return;

    await axios.put('/reserve/available', {
        slot_id: selectedSlot.value.slot_id
    });

    fetchSlots(); // 새로고침
};

// 🔹 예약불가
const blockSlot = async () => {
    if (!selectedSlot.value) return;

    await axios.put('/reserve/block', {
        slot_id: selectedSlot.value.slot_id
    });

    findSlotDateTime(); // 새로고침
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
