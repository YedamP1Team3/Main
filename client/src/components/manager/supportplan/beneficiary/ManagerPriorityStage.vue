<script setup>
import { ref, computed } from 'vue';
import { useSurveyStore } from '@/stores/useSurveyStore';

const emit = defineEmits(['close']);
const surveyStore = useSurveyStore();

// ⭐️ 스토어에서 직접 상태와 이름 가져오기 (Props 완전 제거)
const beneName = computed(() => surveyStore.selected_bene_detail?.bene_name || '선택된 지원자');
const status = computed(() => surveyStore.priority_data.progress_status);
const rejectReason = computed(() => surveyStore.priority_data.rejection_reason);

const selectedStage = ref('');

// 동적 타이틀 텍스트
const titleText = computed(() => {
    return status.value === 'rejected' ? `${beneName.value} 님의\n승인이 반려되었습니다` : `${beneName.value} 님의\n대기 단계를 선택해주세요`;
});

// 동적 버튼 텍스트
const submitButtonText = computed(() => {
    return status.value === 'rejected' ? '재승인 요청' : '승인 요청';
});

const selectStage = (stage) => {
    selectedStage.value = stage;
};

// ⭐️ 승인 요청 액션 (직접 스토어 호출!)
const handleSubmit = async () => {
    if (!selectedStage.value) {
        alert('대기 단계를 선택해주세요.');
        return;
    }

    // 💡 여기서 스토어 함수를 실행하면, DB에 저장된 후 progress_status가 'pending'으로 바뀝니다.
    // 그 순간 부모(Switch)의 v-if 조건이 반응하여 이 Stage 화면을 없애고 Result 화면을 띄웁니다! (반응성 마법)
    await surveyStore.requestPriority(selectedStage.value);
};

const handleCancel = () => {
    emit('close'); // 우측 패널을 아예 빈 화면으로 만들고 싶을 때 부모로 이벤트 전달
};
</script>

<template>
    <div class="priority-container">
        <!-- 타이틀 영역 (v-html로 줄바꿈 처리) -->
        <div class="title-area">
            <h2 v-html="titleText.replace('\n', '<br>')"></h2>
        </div>

        <!-- 반려 상태일 때만 보이는 사유 텍스트 -->
        <div v-if="status === 'rejected'" class="reject-reason">
            <p>이유: {{ rejectReason || '부적합 합니다.' }}</p>
        </div>

        <!-- 원형 버튼 그룹 -->
        <div class="circle-group">
            <button class="circle-btn btn-red" :class="{ active: selectedStage === '긴급' }" @click="selectStage('긴급')">긴급</button>
            <button class="circle-btn btn-blue" :class="{ active: selectedStage === '중점' }" @click="selectStage('중점')">중점</button>
            <button class="circle-btn btn-green" :class="{ active: selectedStage === '계획' }" @click="selectStage('계획')">계획</button>
        </div>

        <!-- 하단 액션 버튼 -->
        <div class="action-group">
            <button class="action-btn" @click="handleSubmit">{{ submitButtonText }}</button>
            <button class="action-btn" @click="handleCancel">취소</button>
        </div>

        <!-- 💡 추후 approval_date를 활용해 반려 이력을 보여줄 테이블 자리 (현재는 틀만 유지) -->
        <!-- <div v-if="status === 'rejected'" class="reject-history-container">...</div> -->
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
</style>
