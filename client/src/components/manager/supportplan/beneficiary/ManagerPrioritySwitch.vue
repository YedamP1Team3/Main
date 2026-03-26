<script setup>
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSurveyStore } from '@/stores/useSurveyStore';
// 수정됨: 이동한 자식 컴포넌트 이름으로 임포트 변경
import ManagerPriorityStage from './ManagerPriorityStage.vue';
import ManagerPriorityResult from './ManagerPriorityResult.vue';

const surveyStore = useSurveyStore();
const { priority_data, selected_bene_id } = storeToRefs(surveyStore);

watch(
    () => selected_bene_id.value,
    async (newId) => {
        if (newId) {
            await surveyStore.fetchPriorityInfo(newId);
        }
    },
    { immediate: true }
);

const handleCancelRequest = () => {
    if (confirm('신청을 취소하시겠습니까?')) {
        surveyStore.cancelPriority();
    }
};

const handleAdjustRequest = () => {
    alert('단계 조정 신청 기능은 준비 중입니다.');
};
</script>

<template>
    <div class="priority-switch-wrapper" style="height: 100%">
        <!-- 수정됨: 컴포넌트명 변경 -->
        <ManagerPriorityStage v-if="priority_data.progress_status === 'none' || priority_data.progress_status === 'rejected'" />

        <ManagerPriorityResult v-else-if="priority_data.progress_status === 'pending' || priority_data.progress_status === 'approved'" @cancel-request="handleCancelRequest" @adjust-request="handleAdjustRequest" />
    </div>
</template>

<style scoped>
.priority-switch-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
}
</style>
