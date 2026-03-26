<script setup>
import { computed } from 'vue';
import { useSurveyStore, PRIORITY_MAP } from '@/stores/useSurveyStore'; // ⭐️ 사전 임포트

const emit = defineEmits(['cancel-request', 'adjust-request']);
const surveyStore = useSurveyStore();

// ⭐️ 스토어에서 직접 정보 가져오기 (Props 완전 제거)
const beneName = computed(() => surveyStore.selected_bene_detail?.bene_name || '정보 없음');
const managerName = computed(() => surveyStore.selected_bene_detail?.manager_name || '미배정');
const familyName = computed(() => surveyStore.selected_bene_detail?.family_name || '정보 없음');

const status = computed(() => surveyStore.priority_data.progress_status);
const dbCode = computed(() => surveyStore.priority_data.priority_status);

// ⭐️ 컴포넌트 스스로 영문을 한글로 번역
const stageNameKor = computed(() => {
    return PRIORITY_MAP[dbCode.value] || '알 수 없음';
});

// 타이틀 텍스트
const titleText = computed(() => {
    return status.value === 'approved' ? '신청이 승인되었습니다!' : '신청이 완료되었습니다!';
});

// 원 색상 결정
const circleColorClass = computed(() => {
    if (stageNameKor.value === '긴급') return 'bg-red';
    if (stageNameKor.value === '중점') return 'bg-blue';
    if (stageNameKor.value === '계획') return 'bg-green';
    return 'bg-blue'; // 기본값
});
</script>

<template>
    <div class="result-container">
        <!-- 1. 타이틀 영역 -->
        <h2 class="result-title">{{ titleText }}</h2>

        <!-- 2. 신청 정보 요약 (스토어 데이터 직접 바인딩) -->
        <div class="info-summary">
            <!-- 날짜 정보는 추후 반려 내역용으로 사용하기 위해 화면에서는 제외 -->
            <p>담당자 : {{ managerName }}</p>
            <p>보호자 : {{ familyName }}</p>
            <p>지원자 : {{ beneName }}</p>
        </div>

        <!-- 3. 선택된 단계 (큰 원 1개) -->
        <div class="stage-circle" :class="circleColorClass">
            {{ stageNameKor }}
        </div>

        <!-- 4. 상태별 하단 버튼 영역 -->
        <div class="action-area">
            <!-- 소문자로 완벽히 통일된 상태 비교 -->
            <button v-if="status === 'pending'" class="btn-cancel" @click="emit('cancel-request')">취소하기</button>
            <button v-else-if="status === 'approved'" class="btn-adjust" @click="emit('adjust-request')">단계조정신청</button>
        </div>
    </div>
</template>

<style scoped>
/* 기존 스타일과 100% 동일하게 유지하시면 됩니다. (생략) */
.result-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 40px;
    background-color: #ffffff;
    text-align: center;
}
.result-title {
    font-size: 1.6rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 20px;
}
.info-summary {
    margin-bottom: 40px;
    font-size: 1.1rem;
    color: #334155;
    line-height: 1.6;
}
.stage-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    font-size: 1.8rem;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 40px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}
.bg-red {
    background-color: #ef4444;
}
.bg-blue {
    background-color: #3b82f6;
}
.bg-green {
    background-color: #22c55e;
}
.action-area button {
    padding: 12px 40px;
    font-size: 1.1rem;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    color: #ffffff;
}
.btn-cancel {
    background-color: #6366f1;
}
.btn-cancel:hover {
    background-color: #4f46e5;
}
.btn-adjust {
    background-color: #475569;
}
.btn-adjust:hover {
    background-color: #334155;
}
</style>
