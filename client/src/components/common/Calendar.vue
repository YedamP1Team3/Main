<template>
    <div class="calendar">
        <!-- 헤더 -->
        <div class="calendar-header">
            <button @click="prevMonth">‹</button>
            <span>{{ currentYear }}년 {{ currentMonth + 1 }}월</span>
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
    width: 320px;
    background: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    margin-bottom: 10px;
}

.calendar-header button {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
}

.calendar-days,
.calendar-dates {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
}

.day-label {
    text-align: center;
    font-size: 12px;
    color: #888;
    margin-bottom: 5px;
}

.date-cell {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 8px;
    transition: 0.2s;
}

.date-cell:hover {
    background: #e6f0ff;
}

.date-cell.today {
    border: 1px solid #3b82f6;
}

.date-cell.selected {
    background: #3b82f6;
    color: white;
}

.date-cell.empty {
    cursor: default;
}
</style>
