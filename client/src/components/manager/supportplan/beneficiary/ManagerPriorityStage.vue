<script setup>
import { ref, computed, watch } from 'vue';
// ⭐️ PRIORITY_MAP을 가져옵니다. (영문 DB 코드를 한글 버튼과 매칭하기 위함)
import { useSurveyStore, PRIORITY_MAP } from '@/stores/useSurveyStore';

const emit = defineEmits(['close']);
const surveyStore = useSurveyStore();

const beneName = computed(() => surveyStore.selected_bene_detail?.bene_name || '선택된 지원자');
const status = computed(() => surveyStore.priority_data.progress_status);

const rejectHistory = computed(() => {
    // 배열 파싱 로직 다 지우고, 객체 1개짜리 배열로 감싸서 리턴 (기존 template 호환을 위해)
    const reason = surveyStore.priority_data.rejection_reason;
    const date = surveyStore.priority_data.approval_date; // 반려 시 찍힌 시간

    if (!reason) return [];

    // YYYY-MM-DD 등 원하는 시간 포맷 변환이 필요하다면 여기서 처리
    return [{ date: date, reason: reason }];
});

const selectedStage = ref('');

// ⭐️ [핵심 추가] 화면이 열릴 때(마운트 될 때) 기존 신청 단계를 자동으로 선택해 둠
watch(
    () => surveyStore.priority_data.priority_status,
    (newCode) => {
        if (newCode && newCode !== 'none') {
            // DB의 영문 코드(urgent 등)를 한글(긴급 등)로 변환해서 버튼 활성화
            selectedStage.value = PRIORITY_MAP[newCode.toLowerCase()] || '';
        } else {
            selectedStage.value = '';
        }
    },
    { immediate: true } // 컴포넌트가 렌더링되자마자 즉시 실행
);

const titleText = computed(() => {
    return status.value === 'rejected' ? `${beneName.value} 님의\n승인이 반려되었습니다` : `${beneName.value} 님의\n대기 단계를 선택해주세요`;
});

const submitButtonText = computed(() => {
    return status.value === 'rejected' ? '재승인 요청' : '승인 요청';
});

const selectStage = (stage) => {
    selectedStage.value = stage;
};

const handleSubmit = async () => {
    if (!selectedStage.value) {
        alert('대기 단계를 선택해주세요.');
        return;
    }
    await surveyStore.requestPriority(selectedStage.value);
};

const handleCancel = () => {
    emit('close');
};
</script>
<template>
    <div class="priority-container">
        <div class="title-area">
            <h2 v-html="titleText.replace('\n', '<br>')"></h2>
        </div>

        <!-- ⭐️ 1. 원형 버튼과 액션 그룹이 먼저 나옵니다 (Primary Action 집중) -->
        <div class="circle-group">
            <button class="circle-btn btn-red" :class="{ active: selectedStage === '긴급' }" @click="selectStage('긴급')">긴급</button>
            <button class="circle-btn btn-blue" :class="{ active: selectedStage === '중점' }" @click="selectStage('중점')">중점</button>
            <button class="circle-btn btn-green" :class="{ active: selectedStage === '계획' }" @click="selectStage('계획')">계획</button>
        </div>

        <div class="action-group">
            <button class="action-btn" @click="handleSubmit">{{ submitButtonText }}</button>
            <button class="action-btn" @click="handleCancel">취소</button>
        </div>

        <!-- ⭐️ 2. 반려 이력은 화면 하단에 단단한 실선 박스와 함께 배치 (Secondary Info) -->
        <div v-if="status === 'rejected'" class="reject-history-box">
            <h3 class="history-title"><i class="pi pi-exclamation-circle"></i> 반려 사유 (최신순)</h3>

            <div v-if="rejectHistory.length > 0" class="history-list">
                <div v-for="(item, index) in rejectHistory" :key="index" class="history-item">
                    <span class="history-date">{{ item.date }}</span>
                    <p class="history-reason">{{ item.reason }}</p>
                </div>
            </div>
            <div v-else class="reject-reason-empty">
                <p>부적합 합니다. (상세 사유 없음)</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 기존 스타일과 100% 동일하게 유지하시면 됩니다. (생략) */
.priority-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 40px;
    background-color: #ffffff;
    height: 100%;
    overflow-y: auto;
}
.title-area {
    text-align: center;
    margin-bottom: 30px;
}
.title-area h2 {
    font-size: 1.8rem;
    font-weight: 500;
    color: #333;
    line-height: 1.4;
    margin: 0;
}
.reject-reason {
    margin-bottom: 30px;
}
.reject-reason p {
    font-size: 1.4rem;
    font-weight: 600;
    color: #ef4444;
    margin: 0;
}
.circle-group {
    display: flex;
    gap: 30px;
    margin-bottom: 40px;
    padding: 20px;
}
.circle-btn {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    border: none;
    font-size: 1.5rem;
    font-weight: 600;
    color: #000;
    cursor: pointer;
    transition:
        transform 0.2s,
        opacity 0.2s,
        box-shadow 0.2s;
    opacity: 0.5;
}
.circle-btn.active {
    opacity: 1;
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    color: #fff;
}
.btn-red {
    background-color: #ef4444;
}
.btn-blue {
    background-color: #3b82f6;
}
.btn-green {
    background-color: #22c55e;
}
.action-group {
    display: flex;
    gap: 20px;
    margin-bottom: 50px;
}
.action-btn {
    padding: 10px 30px;
    font-size: 1rem;
    color: #333;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 25px;
    cursor: pointer;
    transition: background-color 0.2s;
}
.action-btn:hover {
    background-color: #f8fafc;
}

/* ⭐️ 하단으로 분리된 반려 이력 실선 박스 */
.reject-history-box {
    width: 100%;
    max-width: 500px;
    margin-top: 20px;
    padding: 20px;
    background-color: #ffffff;
    border: 1px solid #cbd5e1; /* 요청하신 명확한 실선 */
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
.history-title {
    font-size: 1.1rem;
    color: #ef4444; /* 경고 느낌의 붉은색 타이틀 */
    margin-top: 0;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 10px;
}
.history-list {
    max-height: 200px;
    overflow-y: auto;
}
.history-item {
    padding-bottom: 12px;
    margin-bottom: 12px;
    border-bottom: 1px dashed #e2e8f0;
}
.history-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}
.history-date {
    display: block;
    font-size: 0.85rem;
    color: #64748b;
    margin-bottom: 4px;
}
.history-reason {
    font-size: 1rem;
    color: #334155;
    margin: 0;
    line-height: 1.5;
    font-weight: 500;
}
.reject-reason-empty {
    color: #ef4444;
    font-weight: 600;
    text-align: center;
    padding: 10px;
}
</style>
