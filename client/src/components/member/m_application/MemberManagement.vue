<script setup>
// 1. Vue 내장 함수
import { ref } from 'vue';
// 2. 외부 라이브러리 (Pinia)
import { storeToRefs } from 'pinia';
// 3. 로컬 스토어 및 기타
import { useSurveyStore } from '@/stores/useSurveyStore';

import TabPlan from './MemberTabPlan.vue';

// 설문 관련 전역 상태 관리를 위한 스토어 호출
const surveyStore = useSurveyStore();

// 스토어에서 '선택된 지원자 ID'와 '신청서 리스트 데이터'를 반응형으로 추출
const { selected_bene_id, application_list } = storeToRefs(surveyStore);

const emit = defineEmits(['select-plan']);
const currentTab = ref('Application', 'Plan');
const beneId = selected_bene_id;

const handleSelectPlan = (planId) => {
    emit('select-plan', planId);
};
</script>

<template>
    <div class="management-container">
        <!-- 상단 탭 메뉴: 클릭 시 currentTab 상태를 변경하여 화면을 전환함 -->
        <nav class="tab-menu">
            <button :class="{ active: currentTab === 'Application' }" @click="currentTab = 'Application'">지원신청서</button>
            <button :class="{ active: currentTab === 'Plan' }" @click="currentTab = 'Plan'">지원계획서</button>
            <button :class="{ active: currentTab === 'Result' }" @click="currentTab = 'Result'">지원결과서</button>
            <button :class="{ active: currentTab === 'Consult' }" @click="currentTab = 'Consult'">상담내역</button>
        </nav>

        <!-- [지원 신청서 탭] 콘텐츠 영역 -->
        <div v-if="currentTab === 'Application'" class="tab-content">
            <div class="content-header">
                <h3>지원 신청서</h3>
                <!-- 추가하기 버튼: 선택된 지원자가 없으면 비활성화, 누르면 설문 작성 모달 오픈 -->
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
                    <!-- 데이터가 없을 때 띄워주는 안내 메시지 -->
                    <tr v-if="application_list.length === 0">
                        <td colspan="4" class="empty-msg">
                            {{ selected_bene_id ? '등록된 신청서가 없습니다.' : '지원자를 먼저 선택해주세요.' }}
                        </td>
                    </tr>
                    <!-- 데이터가 있을 때 반복 출력하며, 클릭 시 조회 모드로 진입 -->
                    <tr v-else v-for="item in application_list" :key="item.id" class="clickable-row" @click="surveyStore.loadApplicationView(item.id)">
                        <td>{{ item.writer }}</td>
                        <td>{{ item.bene_name }}</td>
                        <td>{{ item.priority_status }}</td>
                        <td>{{ item.date }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="tab-content">
            <TabPlan v-if="currentTab === 'Plan'" ref="tabPlanRef" :beneId="beneId" @select-plan="handleSelectPlan" />
        </div>
    </div>
</template>

<style scoped>
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

/* 탭 내부 콘텐츠 스타일 */
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
    background-color: #f8fafc; /* 마우스 올렸을 때 살짝 회색빛 */
}
</style>
