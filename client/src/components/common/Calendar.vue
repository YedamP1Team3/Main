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

            for (let i = 0; i < startDay; i++) {
                dates.push({ day: '', fullDate: null });
            }

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

        const getDayIndex = (date) => {
            if (!date.day || !date.fullDate) return -1;
            return new Date(date.fullDate).getDay();
        };

        const isSunday = (date) => getDayIndex(date) === 0;
        const isSaturday = (date) => getDayIndex(date) === 6;

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
            isSunday,
            isSaturday,
            prevMonth,
            nextMonth
        };
    }
};
</script>

<template>
    <div class="calendar">
        <div class="calendar-header">
            <button @click="prevMonth">‹</button>
            <span class="calendar-title">{{ currentYear }}년 {{ currentMonth + 1 }}월</span>
            <button @click="nextMonth">›</button>
        </div>

        <div class="calendar-days">
            <div v-for="day in days" :key="day" class="day-label">
                {{ day }}
            </div>
        </div>

        <div class="calendar-dates">
            <div
                v-for="date in calendarDates"
                :key="date.fullDate"
                class="date-cell"
                :class="{
                    today: isToday(date),
                    selected: isSelected(date),
                    sunday: isSunday(date),
                    saturday: isSaturday(date),
                    empty: !date.day
                }"
                @click="selectDate(date)"
            >
                {{ date.day }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.calendar {
    width: 100%;
    max-width: 340px;
    height: 348px;

    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 18px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;

    font-size: 22px;
    font-weight: 700;
    color: #111827;
    line-height: 1.2;
}

.calendar-title {
    flex: 1;
    text-align: center;
    font-size: 21px;
    font-weight: 700;
    color: #111827;
}

.calendar-header button {
    width: 34px;
    height: 34px;

    display: flex;
    align-items: center;
    justify-content: center;

    background: #fff;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 19px;
    font-weight: 600;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;
}

.calendar-header button:hover {
    background: #fef9f6;
    border-color: #ffab91;
    color: #ffab91;
}

.calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
    margin-bottom: 8px;
}

.day-label {
    text-align: center;
    font-size: 13px;
    font-weight: 600;
    color: #6b7280;
    padding: 5px 0;
}

.calendar-dates {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
    flex: 1;
}

.date-cell {
    height: 37px;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 15px;
    font-weight: 500;
    color: #374151;

    cursor: pointer;
    border: 1px solid transparent;
    border-radius: 9px;
    box-sizing: border-box;
    transition: all 0.18s ease;
}

.date-cell:hover {
    background: #fef9f6;
    border-color: #ffab91;
    color: #ffab91;
}

.date-cell.sunday {
    color: #ef4444;
}

.date-cell.saturday {
    color: #2563eb;
}

.date-cell.sunday:hover {
    background: #fef9f6;
    border-color: #ffab91;
    color: #ef4444;
}

.date-cell.saturday:hover {
    background: #fef9f6;
    border-color: #ffab91;
    color: #2563eb;
}

.date-cell.today {
    border-color: #ffab91;
    color: #ffab91;
    font-weight: 700;
}

.date-cell.selected {
    background: #ffab91;
    border-color: #ffab91;
    color: #fff;
    font-weight: 700;
}

.date-cell.selected:hover {
    background: #ffab91;
    border-color: #ffab91;
    color: #fff;
}

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
