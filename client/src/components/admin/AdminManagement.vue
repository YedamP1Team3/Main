<script setup>
import { ref, watch } from 'vue';
import { useSurveyStore } from '@/stores/useSurveyStore';
import AdTabPlan from './supportplan/adbeneficiary/AdTabPlan.vue';
import AdTabApplication from './ad_app/AdTabApplication.vue';
import AdResultPlan from './supportplan/adbeneficiary/adResultPlan.vue';
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
    border: 2px solid #f4e2de;
    border-radius: 12px;
    padding: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.tab-menu {
    display: flex;
    background-color: #ffffff;
    border-bottom: 0.5px solid #f4e2de;
    padding: 0 10px;
}

.tab-menu button {
    background: none;
    border: none;
    padding: 15px 20px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #000000;
    cursor: pointer;
    position: relative;
    transition: all 0.2s;
    opacity: 0.3;
}

.tab-menu button.active {
    color: #ffab91;
    opacity: 1;
}

.tab-menu button.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #ffab91;
}

.tab-content {
    padding: 20px;
    min-height: 400px;
}

.content-header {
    margin-bottom: 20px;
}
.content-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #1e293b;
}
.list-table {
    width: 100%;
    border-collapse: collapse;
    text-align: center;
    font-size: 0.9rem;
}
.list-table th {
    padding: 10px;
    font-weight: 600;
    color: #64748b;
    border-top: 1px solid #cbd5e1;
    border-bottom: 1px solid #cbd5e1;
}
.list-table td {
    padding: 12px 10px;
    color: #334155;
    border-bottom: 1px solid #e2e8f0;
}
.empty-msg {
    padding: 30px !important;
    color: #94a3b8 !important;
}
.clickable-row {
    cursor: pointer;
    transition: background-color 0.2s;
}
.clickable-row:hover {
    background-color: #f8fafc;
}
</style>
