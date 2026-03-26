<template>
    <div class="calendar">
        <!-- 헤더 -->
        <div class="calendar-header">
            <button @click="prevMonth">‹</button>
            <span class="calendar-title">{{ currentYear }}년 {{ currentMonth + 1 }}월</span>
            <button @click="nextMonth">›</button>
        </div>

        <!-- 요일 -->
        <div class="calendar-days">
            <div v-for="day in days" :key="day" class="day-label">
                {{ day }}
            </div>
        </div>

        <!-- 날짜 -->
        <div class="calendar-dates">
            <div
                v-for="date in calendarDates"
                :key="date.fullDate"
                class="date-cell"
                :class="{
                    today: isToday(date),
                    selected: isSelected(date),
                    empty: !date.day
                }"
                @click="selectDate(date)"
            >
                {{ date.day }}
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
    name: 'Calendar',

    props: {
        modelValue: String
    },

    emits: ['update:modelValue'],

    setup(props, { emit }) {
        const today = new Date();
        const currentYear = ref(today.getFullYear());
        const currentMonth = ref(today.getMonth());

        const days = ['일', '월', '화', '수', '목', '금', '토'];

        const calendarDates = computed(() => {
            const firstDay = new Date(currentYear.value, currentMonth.value, 1);
            const lastDate = new Date(currentYear.value, currentMonth.value + 1, 0);

            const startDay = firstDay.getDay();
            const totalDays = lastDate.getDate();

            const dates = [];

            // 앞 공백
            for (let i = 0; i < startDay; i++) {
                dates.push({ day: '', fullDate: null });
            }

            // 날짜 채우기
            for (let i = 1; i <= totalDays; i++) {
                const fullDate = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

                dates.push({
                    day: i,
                    fullDate
                });
            }

            return dates;
        });

        const selectDate = (date) => {
            if (!date.day) return;

            emit('update:modelValue', date.fullDate);
        };

        const isToday = (date) => {
            if (!date.day) return false;

            const todayStr = today.toISOString().split('T')[0];
            return date.fullDate === todayStr;
        };

        const isSelected = (date) => {
            return props.modelValue === date.fullDate;
        };

        const prevMonth = () => {
            if (currentMonth.value === 0) {
                currentMonth.value = 11;
                currentYear.value--;
            } else {
                currentMonth.value--;
            }
        };

        const nextMonth = () => {
            if (currentMonth.value === 11) {
                currentMonth.value = 0;
                currentYear.value++;
            } else {
                currentMonth.value++;
            }
        };

        return {
            currentYear,
            currentMonth,
            days,
            calendarDates,
            selectDate,
            isToday,
            isSelected,
            prevMonth,
            nextMonth
        };
    }
};
</script>

<style scoped>
.calendar {
    width: 100%;
    max-width: 340px;
    height: 330px;

    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 16px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}

/* 상단 년/월 + 이동 버튼 */
.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    font-size: 20px;
    font-weight: 700;
    color: #111827;
    line-height: 1.2;
}

.calendar-title {
    flex: 1;
    text-align: center;
    font-size: 20px;
    font-weight: 700;
    color: #111827;
}

.calendar-header button {
    width: 32px;
    height: 32px;

    display: flex;
    align-items: center;
    justify-content: center;

    background: #fff;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 18px;
    font-weight: 600;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;
}

.calendar-header button:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
}

/* 요일 */
.calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 6px;
}

.day-label {
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    padding: 4px 0;
}

/* 날짜 그리드 */
.calendar-dates {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    flex: 1;
}

/* 날짜 셀 */
.date-cell {
    height: 34px;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 14px;
    font-weight: 500;
    color: #374151;

    cursor: pointer;
    border: 1px solid transparent;
    border-radius: 8px;
    box-sizing: border-box;
    transition: all 0.18s ease;
}

.date-cell:hover {
    background: #f3f7ff;
    border-color: #dbeafe;
    color: #2563eb;
}

/* 오늘 날짜 */
.date-cell.today {
    border-color: #03c75a; /* 네이버 느낌 포인트 */
    color: #03c75a;
    font-weight: 700;
}

/* 선택 날짜 */
.date-cell.selected {
    background: #2563eb;
    border-color: #2563eb;
    color: #fff;
    font-weight: 700;
}

/* 빈 칸 */
.date-cell.empty {
    cursor: default;
    background: transparent;
}

.date-cell.empty:hover {
    background: transparent;
    border-color: transparent;
    color: transparent;
}
</style>
