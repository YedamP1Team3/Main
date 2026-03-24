<script setup>
import { ref } from 'vue';
import { useSurveyStore } from '@/stores/useSurveyStore';
import { storeToRefs } from 'pinia';

const surveyStore = useSurveyStore();
const { selected_bene_id, application_list } = storeToRefs(surveyStore);

const props = defineProps({
    beneId: { type: [String, Number] }
});

const currentTab = ref('Application');
</script>

<template>
    <div class="management-container">
        <nav class="tab-menu">
            <button :class="{ active: currentTab === 'Application' }" @click="currentTab = 'Application'">지원신청서</button>
            <button :class="{ active: currentTab === 'Plan' }" @click="currentTab = 'Plan'">지원계획서</button>
            <button :class="{ active: currentTab === 'Result' }" @click="currentTab = 'Result'">지원결과서</button>
            <button :class="{ active: currentTab === 'Consult' }" @click="currentTab = 'Consult'">상담내역</button>
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
                        <th>작성일자</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="application_list.length === 0">
                        <td colspan="3" class="empty-msg">
                            {{ selected_bene_id ? '등록된 신청서가 없습니다.' : '지원자를 먼저 선택해주세요.' }}
                        </td>
                    </tr>
                    <tr v-else v-for="item in application_list" :key="item.id">
                        <td>{{ item.writer }}</td>
                        <td>{{ item.bene_name }}</td>
                        <td>{{ item.date }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-else class="tab-content">
            <p class="empty-msg">해당 탭의 내용이 없습니다.</p>
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
</style>
