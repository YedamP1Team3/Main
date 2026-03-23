<template>
    <div class="layout">
        <!-- 사이드바 -->
        <RsvSideBar />

        <!-- 메인 -->
        <div class="main">
            <h2>일정 관리</h2>

            <div class="content">
                <Calendar @select-date="handleDateSelect" />
                <TimeSlot :selectedDate="selectedDate" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import RsvSideBar from '@/components/reservation/RsvSideBar.vue';
import Calendar from '@/components/reservation/Calendar.vue';
import TimeSlot from '@/components/reservation/TimeSlot.vue';

const selectedDate = ref(null);

const handleDateSelect = (date) => {
    selectedDate.value = date;
};
</script>

<style scoped>
.layout {
    display: flex;
    height: 100vh;
}

/* 메인 영역 */
.main {
    flex: 1;
    padding: 20px;
    box-sizing: border-box;
}

/* 🔥 핵심: grid로 변경 */
.content {
    display: grid;
    grid-template-columns: 1fr 1fr; /* 균등 분할 */
    gap: 20px; /* 요청한 간격 */
}

/* 각 영역이 꽉 차도록 */
.content > * {
    width: 100%;
    height: 100%;
}
</style>
