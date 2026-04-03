<script setup>
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSurveyStore } from '@/stores/useSurveyStore';
import TabPlan from './m_plan_result/MemberTabPlan.vue';
import TabResult from './m_plan_result/MemberTabResult.vue';

// 아직 처리 중인 신청서가 있으면 같은 대상자에 대해 중복 신청을 막는다.
const ACTIVE_APPLICATION_STATUSES = new Set(['대기', '진행중', '진행 중']);

const props = defineProps({
    activeTab: {
        type: String,
        default: 'Application'
    }
});

const emit = defineEmits(['select-plan', 'change-tab', 'select-result']);

const surveyStore = useSurveyStore();
const { selected_bene_id, application_list } = storeToRefs(surveyStore);

const currentTab = ref('Application');

const hasActiveApplication = computed(() => {
    return application_list.value.some((item) => ACTIVE_APPLICATION_STATUSES.has(item.app_status));
});

const handleTabChange = (tabName) => {
    currentTab.value = tabName;
    emit('change-tab', tabName);
};

watch(
    () => props.activeTab,
    (newTab) => {
        currentTab.value = newTab || 'Application';
    },
    { immediate: true }
);
</script>

<template>
    <div class="management-container">
        <nav class="tab-menu">
            <button :class="{ active: currentTab === 'Application' }" @click="handleTabChange('Application')">지원신청서</button>
            <button :class="{ active: currentTab === 'Plan' }" @click="handleTabChange('Plan')">지원계획서</button>
            <button :class="{ active: currentTab === 'Result' }" @click="handleTabChange('Result')">지원결과서</button>
        </nav>

        <div v-if="currentTab === 'Application'" class="tab-content">
            <div class="content-header">
                <h3>지원 신청서</h3>
                <button class="btn-add" :disabled="!selected_bene_id || hasActiveApplication" @click="surveyStore.openSurvey()">
                    {{ hasActiveApplication ? '진행 중인 신청서 존재' : '+ 추가하기' }}
                </button>
            </div>

            <table class="list-table">
                <thead>
                    <tr>
                        <th>작성자</th>
                        <th>지원대상자</th>
                        <th>신청단계</th>
                        <th>작성일자</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="application_list.length === 0">
                        <td colspan="4" class="empty-msg">
                            {{ selected_bene_id ? '등록된 신청서가 없습니다.' : '지원대상자를 먼저 선택해 주세요.' }}
                        </td>
                    </tr>

                    <tr v-else v-for="item in application_list" :key="item.id" class="clickable-row" @click="surveyStore.loadApplicationView(item.id)">
                        <td>{{ item.writer }}</td>
                        <td>{{ item.bene_name }}</td>
                        <td>
                            <span class="status-badge">{{ item.app_status || '대기' }}</span>
                        </td>
                        <td>{{ item.date }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-else-if="currentTab === 'Plan'" class="tab-content">
            <TabPlan :beneId="selected_bene_id" @select-plan="(planId) => emit('select-plan', planId)" />
        </div>

        <div v-else-if="currentTab === 'Result'" class="tab-content">
            <TabResult :beneId="selected_bene_id" @select-result="(resultId) => emit('select-result', resultId)" />
        </div>
    </div>
</template>

<style scoped>
.management-container {
    background-color: #ffffff;
    border: 2px solid #f4e2de;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    margin-top: 20px;
}

.tab-menu {
    display: flex;
    padding: 0 10px;
    background-color: #ffffff;
    border-bottom: 1px solid #f1f5f9;
}

.tab-menu button {
    position: relative;
    padding: 15px 20px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #94a3b8;
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.2s;
    opacity: 0.7;
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
}

.content-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
}

.content-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #1e293b;
}

.btn-add {
    padding: 4px 10px;
    font-size: 0.8rem;
    color: #fff;
    background-color: #ffab91;
    border: 1px solid #f4e2de;
    border-radius: 4px;
    cursor: pointer;
}

.btn-add:hover:not(:disabled) {
    background-color: #ff8a65;
}

.btn-add:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.list-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed; /* 글자가 길어져도 표가 깨지지 않게 고정 */
    text-align: center;
}

.list-table th {
    background-color: #f8fafc; /* 오른쪽 이미지의 연한 회색 배경 */
    color: #64748b;
    font-size: 0.85rem;
    font-weight: 700;
    padding: 12px 10px;
    border-top: none; /* 기존 왼쪽 이미지에 있던 맨 위 얇은 선 제거 */
    border-bottom: 2px solid #e2e8f0; /* 헤더 아래쪽 두꺼운 구분선 */
}

.list-table td {
    padding: 16px 10px;
    font-size: 0.9rem;
    color: #334155;
    border-bottom: 1px solid #f1f5f9; /* 데이터 간의 아주 얇고 연한 구분선 */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.empty-msg {
    padding: 30px !important;
    color: #94a3b8 !important;
    text-align: center;
}

.clickable-row {
    cursor: pointer;
    transition: background-color 0.2s;
}

.clickable-row:hover {
    background-color: #f8fafc;
}
</style>
