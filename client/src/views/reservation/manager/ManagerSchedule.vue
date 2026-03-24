<template>
    <div class="container">
        <Calendar @selectDate="handleDate" />

        <TimeSlot :selectedDate="selectedDate" />
    </div>
</template>

<script>
import { ref } from 'vue';
import Calendar from '@/components/reservation/Calendar.vue';
import TimeSlot from '@/components/reservation/TimeSlot.vue';

export default {
    components: {
        Calendar,
        TimeSlot
    },
    setup() {
        const selectedDate = ref(null);

        const handleDate = (date) => {
            selectedDate.value = date;
            console.log('선택 날짜:', date);
        };

        return {
            selectedDate,
            handleDate
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
