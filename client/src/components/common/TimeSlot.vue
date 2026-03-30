<template>
    <div class="timeslot-container">
        <!-- 헤더 -->
        <div class="header">
            <div class="header-text">
                <h3>시간 선택</h3>
                <p v-if="selectedDate">{{ selectedDate }}</p>
                <p v-else>날짜를 먼저 선택하세요</p>
            </div>

            <!-- 오전 / 오후 토글 -->
            <div class="period-toggle">
                <button :class="{ active: period === 'AM' }" @click="period = 'AM'">오전</button>
                <button :class="{ active: period === 'PM' }" @click="period = 'PM'">오후</button>
            </div>
        </div>

        <!-- 시간 리스트 -->
        <div class="time-grid">
            <div
                v-for="slot in timeSlots"
                :key="slot.time"
                class="time-item"
                :class="{
                    selected: selectedTimes.includes(slot.time) && slot.status !== 'blocked',
                    'selected-blocked': selectedTimes.includes(slot.time) && slot.status === 'blocked' && mode === 'manager',

                    reserved: slot.status === 'reserved',
                    blocked: slot.status === 'blocked' && mode === 'manager',
                    unavailable: slot.status === 'reserved' || (slot.status === 'blocked' && mode !== 'manager')
                }"
                @click="toggleTime(slot)"
            >
                {{ slot.time }}
            </div>
        </div>

        <!-- 예약불가 시간 요약 -->
        <div v-if="mode === 'manager'" class="summary-box">
            <h4>예약불가 시간</h4>

            <ul v-if="filteredBlockedSummary.length > 0" class="summary-list">
                <li v-for="(item, index) in filteredBlockedSummary" :key="index">{{ item }}</li>
            </ul>

            <p v-else class="summary-empty">등록된 예약불가 시간이 없습니다.</p>
        </div>

        <!-- 액션 버튼 -->
        <div class="action-buttons">
            <!-- 담당자 모드 -->
            <template v-if="mode === 'manager'">
                <button class="unavailable-btn" @click="handleManagerAction('unavailable')">예약차단</button>
                <button class="available-btn" @click="handleManagerAction('available')">차단해제</button>
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
import { toggleTimeHandler } from '@/utils/timeslot';

export default {
    name: 'TimeSlot',

    props: {
        selectedDate: String,
        slots: {
            type: Array,
            default: () => []
        },
        blockedSummary: {
            type: Array,
            default: () => []
        },
        mode: {
            type: String,
            default: 'manager'
        }
    },

    emits: ['blockTimes', 'reserveTimes'],

    setup(props, { emit }) {
        const period = ref('AM');
        const selectedTimes = ref([]);

        const timeSlots = computed(() => {
            if (!props.slots.length) return [];

            return props.slots.filter((s) => (period.value === 'AM' ? s.time < '13:00' : s.time >= '14:00'));
        });

        const filteredBlockedSummary = computed(() => {
            if (!props.blockedSummary.length) return [];

            return props.blockedSummary.filter((item) => {
                const start = item.split(' ~ ')[0];
                return period.value === 'AM' ? start < '13:00' : start >= '14:00';
            });
        });

        const toggleTime = (slot) => {
            selectedTimes.value = toggleTimeHandler(slot, selectedTimes.value, props.mode);
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
            filteredBlockedSummary,
            toggleTime,
            handleManagerAction,
            handleUserAction
        };
    }
};
</script>

<style scoped>
.timeslot-container {
    width: 100%;
    max-width: 520px;
    background: #fff;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
    box-sizing: border-box;
}

/* 헤더 */
.header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
}

.header-text {
    flex: 1;
    min-width: 0;
}

.header h3 {
    margin: 0 0 6px 0;
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    line-height: 1.2;
}

.header p {
    margin: 0;
    font-size: 16px;
    color: #6b7280;
    font-weight: 500;
    line-height: 1.3;
}

/* 오전/오후 */
.period-toggle {
    display: flex;
    align-items: center;
    gap: 6px; /* 버튼 간격 좁힘 */
    flex-shrink: 0;
    margin: 0;
}

.period-toggle button {
    min-width: 56px;
    height: 32px; /* header p 16px 기준으로 밸런스 맞춤 */
    padding: 0 12px;

    border: 1px solid #d1d5db;
    background: #fff;
    color: #374151;
    border-radius: 8px;

    font-size: 13px;
    font-weight: 600;
    line-height: 1;
    cursor: pointer;
    transition: all 0.18s ease;
    box-sizing: border-box;
}

.period-toggle button:hover {
    background: #f9fafb;
    border-color: #9ca3af;
}

.period-toggle button.active {
    background: #2563eb;
    color: #fff;
    border-color: #2563eb;
}

/* 시간 grid */
.time-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
}

.time-item {
    width: 100%;
    min-height: 42px;
    padding: 10px 8px;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-sizing: border-box;
    cursor: pointer;
    transition: all 0.18s ease;
    user-select:;
}

.time-item:hover {
    background: #fee2e2;
    border-color: #f87171;
    color: #b91c1c;
}

/* 비활성 */
.time-item.reserved,
.time-item.unavailable {
    cursor: not-allowed;
    opacity: 0.55;
    background: #f9fafb;
    color: #9ca3af;
}

/* 회색처리된 슬롯은 hover 변화 없음 */
.time-item.reserved:hover,
.time-item.unavailable:hover {
    background-color: #e0e0e0;
    border-color: #cfcfcf;
    color: #777;
}
/* 선택됨 */
.time-item.selected {
    background: #ef4444;
    color: #fff;
    border-color: #dc2626;
    font-weight: 600;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

/* 예약불가 */
.time-item.blocked {
    background: #fff;
    color: #dc2626;
    border: 1px solid #fca5a5;
    font-weight: 600;
    cursor: pointer;
}

.time-item.blocked:hover {
    background: #eff6ff; /* 연한 파랑 배경 */
    border-color: #93c5fd; /* 연한 파랑 border */
    color: #1d4ed8;
}

/* 예약불가 + 선택 */
.time-item.blocked.selected {
    background: #2563eb;
    color: #fff;
    border-color: #2563eb;
    font-weight: 700;
}

/* 하단 버튼 */
.action-buttons {
    display: flex;
    gap: 10px;
    margin-top: 18px;
}

.available-btn,
.unavailable-btn {
    flex: 1;
    height: 42px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s ease;
}

/* 차단해제 버튼 */
.available-btn {
    background: #fff;
    color: #2563eb;
    border: 1px solid #1d4ed8;
}

.available-btn:hover {
    background: #eff6ff;
    border-color: #93c5fd;
}

/* 예약차단 */
.unavailable-btn {
    background: #fff;
    color: #dc2626;
    border: 1px solid #fca5a5;
}

.unavailable-btn:hover {
    background: #fff5f5;
    border-color: #f87171;
}

.summary-box {
    margin-top: 18px;
    padding: 14px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fafafa;
}

.summary-box h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    font-weight: 700;
    color: #111827;
}

.summary-list {
    margin: 0;
    padding-left: 18px;
}

.summary-list li {
    margin-bottom: 6px;
    font-size: 14px;
    color: #374151;
}

.summary-empty {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
}

.action-buttons {
    display: flex;
    gap: 10px;
    margin-top: 18px;
}

.available-btn,
.unavailable-btn {
    flex: 1;
    height: 42px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s ease;
}

.available-btn {
    background: #2563eb;
    color: #fff;
    border: 1px solid #2563eb;
}

.available-btn:hover {
    background: #1d4ed8;
    border-color: #1d4ed8;
}

.unavailable-btn {
    background: #fff;
    color: #dc2626;
    border: 1px solid #fca5a5;
}

.unavailable-btn:hover {
    background: #fff5f5;
    border-color: #f87171;
}
</style>
