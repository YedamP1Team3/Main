<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useSurveyStore, PRIORITY_MAP } from '@/stores/useSurveyStore';
import TabPlan from './MemberTabPlan.vue';

const surveyStore = useSurveyStore();

// 스토어에서 '선택된 지원자 ID'와 '신청서 리스트 데이터' 추출
const { selected_bene_id, application_list } = storeToRefs(surveyStore);

// ⭐️ 부모에게 보낼 이벤트 2가지 정의 (탭 변경, 계획서 선택)
const emit = defineEmits(['select-plan', 'change-tab']);

// 현재 탭 상태 (기본값 하나만 들어가야 함)
const currentTab = ref('Application');

// ⭐️ 탭 클릭 시 실행될 함수: 탭 상태를 바꾸고 부모에게도 알림
const handleTabChange = (tabName) => {
    currentTab.value = tabName;
    emit('change-tab', tabName);
};

// 자식(TabPlan)에서 특정 계획서를 클릭했을 때 부모로 토스
const handleSelectPlan = (planId) => {
    emit('select-plan', planId);
};

// ⭐️ 2. 리스트의 영문 코드를 한글로 번역해 주는 함수 추가
const formatPriority = (item) => {
    console.log(item);
    // 1. 진행 상태가 pending이면 무조건 '대기'
    if (item.progress_status === 'pending') return '대기';
    console.log(item);

    // 2. 그 외에는 원래대로 번역
    if (!item.priority_status) return '미신청';
    const lowerCode = String(item.priority_status).toLowerCase();
    return PRIORITY_MAP[lowerCode] || item.priority_status;
};
</script>

<template>
    <div class="management-container">
        <nav class="tab-menu">
            <button :class="{ active: currentTab === 'Application' }" @click="handleTabChange('Application')">지원신청서</button>
            <button :class="{ active: currentTab === 'Plan' }" @click="handleTabChange('Plan')">지원계획서</button>
            <button :class="{ active: currentTab === 'Result' }" @click="handleTabChange('Result')">지원결과서</button>
            <button :class="{ active: currentTab === 'Consult' }" @click="handleTabChange('Consult')">상담내역</button>
        </nav>

        <div v-if="currentTab === 'Application'" class="tab-content">
            <div class="content-header">
                <h3>지원 신청서</h3>
                <button class="btn-add" :disabled="!selected_bene_id" @click="surveyStore.openSurvey()">+ 추가하기</button>
            </div>

            <table class="list-table">
                <thead>
                    <tr>
                        <th>작성자</th>
                        <th>지원자</th>
                        <th>대기단계</th>
                        <th>작성일자</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="application_list.length === 0">
                        <td colspan="4" class="empty-msg">
                            {{ selected_bene_id ? '등록된 신청서가 없습니다.' : '지원자를 먼저 선택해주세요.' }}
                        </td>
                    </tr>
                    <tr v-else v-for="item in application_list" :key="item.id" class="clickable-row" @click="surveyStore.loadApplicationView(item.id)">
                        <td>{{ item.writer }}</td>
                        <td>{{ item.bene_name }}</td>
                        <td>{{ formatPriority(item) }}</td>
                        <td>{{ item.date }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="currentTab === 'Plan'" class="tab-content">
            <TabPlan ref="tabPlanRef" :beneId="selected_bene_id" @select-plan="handleSelectPlan" />
        </div>
    </div>
</template>

<style scoped>
/* 기존 스타일 그대로 유지 (생략하지 않고 복붙하시면 됩니다) */
.management-container {
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
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
    color: #475569;
    background-color: #fff;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    cursor: pointer;
}
.btn-add:hover:not(:disabled) {
    background-color: #f1f5f9;
}
.btn-add:disabled {
    opacity: 0.4;
    cursor: not-allowed;
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
