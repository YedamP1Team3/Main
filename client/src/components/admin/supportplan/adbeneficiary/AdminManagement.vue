<script setup>
import { ref, watch } from 'vue';
import { useSurveyStore } from '@/stores/useSurveyStore';
import AdTabPlan from './AdTabPlan.vue';
import AdTabApplication from './AdTabApplication.vue';
import AdResultPlan from './adResultPlan.vue';
import TabPlanDetail from '@/components/manager/supportplan/beneficiary/TabPlanDetail.vue';

const props = defineProps({
    beneId: { type: [String, Number] }
});

const emit = defineEmits(['select-plan', 'select-app', 'assign-manager', 'select-result']);

const surveyStore = useSurveyStore();

// admin 화면은 기본적으로 계획서 탭부터 보도록 시작한다.
const currentTab = ref('Plan');
const tabPlanRef = ref(null);

// 결과서 탭 안에서 "리스트 보기 / 계획서 상세 보기" 를 한 번 더 나눈다.
const leftMode = ref('list');
const selectedSubPlanId = ref(null);

const handleSelectSubPlan = (planId) => {
    if (!planId) return;

    selectedSubPlanId.value = planId;
    leftMode.value = 'plan';
    currentTab.value = 'Result';
};

const handleCloseSubPlan = () => {
    leftMode.value = 'list';
    selectedSubPlanId.value = null;
};

watch(
    () => surveyStore.priority_data.progress_status,
    (newValue, oldValue) => {
        // 대기단계 승인/반려 이후에는 계획 목록이 바뀔 수 있어서
        // 현재 열려 있는 계획 탭을 다시 읽어오게 한다.
        if (oldValue && newValue !== oldValue && tabPlanRef.value) {
            tabPlanRef.value.fetchPlanList(props.beneId);
        }
    }
);

watch(
    () => props.beneId,
    () => {
        handleCloseSubPlan();
    }
);

watch(
    () => currentTab.value,
    (tab) => {
        if (tab !== 'Result') {
            handleCloseSubPlan();
        }
    }
);

defineExpose({
    refreshTabPlan: () => {
        if (tabPlanRef.value) {
            tabPlanRef.value.fetchPlanList(props.beneId);
        }
    },
    openSubPlan: handleSelectSubPlan,
    closeSubPlan: handleCloseSubPlan
});
</script>

<template>
    <div class="management-container">
        <nav class="tab-menu">
            <button :class="{ active: currentTab === 'Application' }" @click="currentTab = 'Application'">지원신청서</button>
            <button :class="{ active: currentTab === 'Plan' }" @click="currentTab = 'Plan'">지원계획서</button>
            <button :class="{ active: currentTab === 'Result' }" @click="currentTab = 'Result'">지원결과서</button>
            <button :class="{ active: currentTab === 'Consult' }" @click="currentTab = 'Consult'">상담내역</button>
        </nav>

        <div class="tab-content">
            <AdTabApplication v-if="currentTab === 'Application'" :beneId="beneId" @select-app="(appId) => emit('select-app', appId)" @assign-manager="() => emit('assign-manager')" />
            <AdTabPlan v-if="currentTab === 'Plan'" ref="tabPlanRef" :beneId="beneId" @select-plan="(planId) => emit('select-plan', planId)" />

            <div v-if="currentTab === 'Result'">
                <AdResultPlan v-if="leftMode === 'list'" :beneId="beneId" @select-result="(resultId) => emit('select-result', resultId)" />
                <TabPlanDetail v-else :planId="selectedSubPlanId" @close="handleCloseSubPlan" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.management-container {
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    overflow: hidden;
}

.tab-menu {
    display: flex;
    background-color: #ffffff;
    border-bottom: 1px solid #f1f5f9;
    padding: 0 10px;
}

.tab-menu button {
    background: none;
    border: none;
    padding: 15px 20px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #94a3b8;
    cursor: pointer;
    position: relative;
    transition: all 0.2s;
}

.tab-menu button.active {
    color: #3b82f6;
}

.tab-menu button.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #3b82f6;
}

.tab-content {
    padding: 20px;
    min-height: 400px;
}
</style>
