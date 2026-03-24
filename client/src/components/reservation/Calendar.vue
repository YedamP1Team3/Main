<template>
    <div class="calendar-container">
        <div class="calendar">
            <!-- 헤더 -->
            <div class="calendar-header">
                <button @click="prevMonth">◀</button>
                <span>{{ currentYear }}년 {{ currentMonth + 1 }}월</span>
                <button @click="nextMonth">▶</button>
            </div>

            <!-- 요일 -->
            <div class="calendar-days">
                <div v-for="(day, index) in daysOfWeek" :key="day" class="day" :class="getDayClass(index)">
                    {{ day }}
                </div>
            </div>

            <!-- 날짜 -->
            <div class="calendar-dates">
                <div
                    v-for="(date, index) in calendarDates"
                    :key="index"
                    class="date"
                    :class="[{ empty: !date }, getDayClass(index % 7), isSelected(date) ? 'selected' : '', isToday(date) ? 'today' : '', isPast(date) ? 'past' : '']"
                    @click="!isPast(date) && selectDate(date)"
                >
                    {{ date || '' }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['select-date']);

const today = new Date();
const currentYear = ref(today.getFullYear());
const currentMonth = ref(today.getMonth());

const selectedDate = ref(null);

const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

// 📅 달력 날짜 생성
const calendarDates = computed(() => {
    const firstDay = new Date(currentYear.value, currentMonth.value, 1);
    const lastDate = new Date(currentYear.value, currentMonth.value + 1, 0).getDate();

    const startDay = firstDay.getDay();
    const dates = [];

    for (let i = 0; i < startDay; i++) {
        dates.push(null);
    }

    for (let i = 1; i <= lastDate; i++) {
        dates.push(i);
    }

    return dates;
});

// ⬅ 이전달
const prevMonth = () => {
    if (currentMonth.value === 0) {
        currentMonth.value = 11;
        currentYear.value--;
    } else {
        currentMonth.value--;
    }
};

// ➡ 다음달
const nextMonth = () => {
    if (currentMonth.value === 11) {
        currentMonth.value = 0;
        currentYear.value++;
    } else {
        currentMonth.value++;
    }
};

// 📌 날짜 선택
const selectDate = (date) => {
    if (!date) return;

    selectedDate.value = date;

    const selected = new Date(currentYear.value, currentMonth.value, date);
    emit('select-date', selected);
};

// 🔴 오늘 날짜 체크
const isToday = (date) => {
    if (!date) return false;

    const now = new Date();
    return now.getFullYear() === currentYear.value && now.getMonth() === currentMonth.value && now.getDate() === date;
};

// ⛔ 과거 날짜 체크
const isPast = (date) => {
    if (!date) return false;

    const today = new Date();
    const target = new Date(currentYear.value, currentMonth.value, date);

    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    return target < today;
};

// 요일 색상
const getDayClass = (index) => {
    if (index === 0) return 'sunday';
    if (index === 6) return 'saturday';
    return '';
};

// 선택 여부
const isSelected = (date) => {
    return selectedDate.value === date;
};
</script>

<style scoped>
/* 전체 배경 */
.calendar-container {
    background: #f4f8ff;
    padding: 20px;
    border-radius: 16px;
}

/* 카드 */
.calendar {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 헤더 */
.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    font-weight: bold;
}

.calendar-header button {
    background: #e3ecff;
    border: none;
    padding: 6px 10px;
    border-radius: 8px;
    cursor: pointer;
}

.calendar-header button:hover {
    background: #cddcff;
}

/* 요일 */
.calendar-days,
.calendar-dates {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
}

.day {
    text-align: center;
    font-weight: bold;
    padding: 8px 0;
}

/* 날짜 */
.date {
    height: 45px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
}

/* hover */
.date:hover {
    background-color: #eef4ff;
}

/* 빈칸 */
.empty {
    cursor: default;
    background: transparent;
}

/* 일요일 */
.sunday {
    color: #e74c3c;
}

/* 토요일 */
.saturday {
    color: #3498db;
}

/* 선택된 날짜 */
.selected {
    background-color: #4a90e2;
    color: white !important;
    font-weight: bold;
}

/* 오늘 */
.today {
    border: 2px solid #4a90e2;
    font-weight: bold;
}

/* 과거 날짜 */
.past {
    color: #ccc;
    cursor: not-allowed;
}
</style>
