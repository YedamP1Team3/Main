<!-- ManagerPrioritySwitch.vue 전체 코드 교체 -->
<script setup>
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSurveyStore } from '@/stores/useSurveyStore';
import ManagerPriorityStage from './ManagerPriorityStage.vue';
import ManagerPriorityResult from './ManagerPriorityResult.vue';

// ⭐️ 부모(ManagerMain)로 close 이벤트를 던지기 위해 선언
const emit = defineEmits(['close']);

const surveyStore = useSurveyStore();
const { priority_data, selected_bene_id } = storeToRefs(surveyStore);

watch(
    () => selected_bene_id.value,
    async (newId) => {
        if (newId) await surveyStore.fetchPriorityInfo(newId);
    },
    { immediate: true }
);

const handleCancelRequest = () => {
    if (confirm('신청을 취소하시겠습니까?')) surveyStore.cancelPriority();
};

const handleAdjustRequest = () => alert('단계 조정 신청 기능은 준비 중입니다.');
</script>

<template>
    <div class="priority-switch-wrapper" style="height: 100%">
        <!-- ⭐️ @close="emit('close')" 추가로 이벤트 릴레이 -->
        <ManagerPriorityStage v-if="priority_data.progress_status === 'none' || priority_data.progress_status === 'rejected'" @close="emit('close')" />

        <ManagerPriorityResult v-else-if="priority_data.progress_status === 'pending' || priority_data.progress_status === 'approved'" @cancel-request="handleCancelRequest" />
    </div>
</template>

<style scoped>
.priority-switch-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
}
</style>
