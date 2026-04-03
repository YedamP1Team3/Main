<script setup>
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSurveyStore } from '@/stores/useSurveyStore';
import TabPlan from './supportplan/beneficiary/TabPlan.vue';
import TabPlanDetail from './supportplan/beneficiary/TabPlanDetail.vue';
import resultPlan from './supportplan/beneficiary/resultPlan.vue';

const props = defineProps({
    beneId: { type: [String, Number] },
    priorityId: { type: [String, Number] },
    progressStatus: { type: [String, Number] }
});

const emit = defineEmits(['newaddplan', 'select-plan', 'select-result', 'select-app', 'newresultplan']);
const currentTab = ref('Application');
const tabPlanRef = ref(null);

const surveyStore = useSurveyStore();
const { application_list } = storeToRefs(surveyStore);

const leftMode = ref('list');
const selectedSubPlanId = ref(null);

const handleSelectPlan = (planId) => {
    emit('select-plan', planId);
};

const handleResultIdDetail = (data) => {
    emit('select-result', data);
};

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

const viewApplicationDetail = async (appId) => {
    await surveyStore.loadApplicationView(appId);
    emit('select-app', appId);
};

defineExpose({
    refreshTabPlan: () => {
        if (tabPlanRef.value) tabPlanRef.value.fetchPlanList(props.beneId);
    },
    openSubPlan: handleSelectSubPlan,
    closeSubPlan: handleCloseSubPlan
});

watch(
    () => props.beneId,
    () => {
        handleCloseSubPlan();
    }
);

watch(
    () => currentTab.value,
    (tab) => {
        if (tab !== 'Result') handleCloseSubPlan();
    }
);
</script>

<template>
    <div class="management-container">
        <nav class="tab-menu">
            <button :class="{ active: currentTab === 'Application' }" @click="currentTab = 'Application'">지원신청서</button>
            <button :class="{ active: currentTab === 'Plan' }" @click="currentTab = 'Plan'">지원계획서</button>
            <button :class="{ active: currentTab === 'Result' }" @click="currentTab = 'Result'">지원결과서</button>
        </nav>

        <div class="tab-content">
            <div v-if="currentTab === 'Application'">
                <div class="content-header">
                    <h3>지원신청서</h3>
                </div>
                <table class="list-table">
                    <thead>
                        <tr>
                            <th>작성자</th>
                            <th>지원자</th>
                            <th>신청단계</th>
                            <th>작성일자</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="application_list.length === 0">
                            <td colspan="4" class="empty-msg">
                                {{ beneId ? '등록된 신청서가 없습니다.' : '지원자를 먼저 선택해주세요.' }}
                            </td>
                        </tr>
                        <tr v-else v-for="item in application_list" :key="item.id" class="clickable-row" @click="viewApplicationDetail(item.id)">
                            <td>{{ item.writer }}</td>
                            <td>{{ item.bene_name }}</td>
                            <td>{{ item.app_status || '대기' }}</td>
                            <td>{{ item.date }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <TabPlan v-if="currentTab === 'Plan'" ref="tabPlanRef" :beneId="beneId" :priorityId="priorityId" :progressStatus="progressStatus" @newaddplan="(id) => emit('newaddplan', id)" @select-plan="handleSelectPlan" />
            <div v-if="currentTab === 'Result'">
                <resultPlan v-if="leftMode === 'list'" ref="tabPlanRef" :beneId="beneId" :progressStatus="progressStatus" @newresultplan="emit('newresultplan')" @select-result="handleResultIdDetail" />
                <TabPlanDetail v-else-if="leftMode === 'plan'" :planId="selectedSubPlanId" @close="handleCloseSubPlan" />
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
    font-size: 1.2rem;
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
    border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed; /* 글자가 길어져도 표가 깨지지 않게 고정 */
    text-align: center;
}

.list-table th {
    background-color: #fef9f6; /* 오른쪽 이미지의 연한 회색 배경 */
    color: #64748b;
    font-size: 0.85rem;
    font-weight: 700;
    padding: 12px 10px;
    border-top: none; /* 기존 왼쪽 이미지에 있던 맨 위 얇은 선 제거 */
    border-bottom: 2px solid #f4e2de; /* 헤더 아래쪽 두꺼운 구분선 */
}

.list-table td {
    padding: 16px 10px;
    font-size: 0.9rem;
    color: #334155;
    border-bottom: 1px solid #f4e2de; /* 데이터 간의 아주 얇고 연한 구분선 */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
