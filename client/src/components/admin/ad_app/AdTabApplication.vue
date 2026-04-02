<script setup>
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSurveyStore } from '@/stores/useSurveyStore';

const props = defineProps({
    beneId: { type: [String, Number] }
});

const emit = defineEmits(['select-app', 'assign-manager']);
const surveyStore = useSurveyStore();
const { application_list } = storeToRefs(surveyStore);

const assignManager = () => {
    if (!props.beneId) {
        alert('지원대상자를 먼저 선택해 주세요.');
        return;
    }

    if (application_list.value.length === 0) {
        alert('지원신청서가 1개 이상 작성된 대상자에게만 담당자를 배정할 수 있습니다.');
        return;
    }

    emit('assign-manager');
};

const viewApplicationDetail = async (appId) => {
    if (!appId) return;

    await surveyStore.loadApplicationView(appId);
    emit('select-app', appId);
};

watch(
    () => props.beneId,
    (newId) => {
        if (newId) {
            surveyStore.fetchApplicationList(newId);
        }
    },
    { immediate: true }
);
</script>

<template>
    <div class="application-container">
        <div class="header-row">
            <h2>지원신청서 관리</h2>
            <div class="btn-group">
                <button class="btn-assign" @click="assignManager"><i class="pi pi-user-plus mr-2"></i> 담당자 배정</button>
            </div>
        </div>

        <table class="list-table">
            <thead>
                <tr>
                    <th>신청번호</th>
                    <th>작성자</th>
                    <th>신청단계</th>
                    <th>신청일자</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="application_list.length === 0">
                    <td colspan="4" class="empty-msg">등록된 지원신청서가 없습니다.</td>
                </tr>
                <tr v-else v-for="app in application_list" :key="app.id" class="clickable-row" @click="viewApplicationDetail(app.id)">
                    <td>{{ app.id }}</td>
                    <td>{{ app.writer }}</td>
                    <td class="status-text">{{ app.app_status || '대기' }}</td>
                    <td>{{ app.date }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.application-container {
    width: 100%;
}
.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
}
.btn-assign {
    padding: 8px 16px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #ffffff;
    background-color: #10b981;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
}
.btn-assign:hover {
    background-color: #059669;
}
.list-table {
    width: 100%;
    border-collapse: collapse;
    text-align: center;
}
.list-table th {
    padding: 12px;
    font-weight: 600;
    color: #64748b;
    background-color: #f8fafc;
    border-top: 1px solid #e2e8f0;
    border-bottom: 2px solid #e2e8f0;
}
.list-table td {
    padding: 14px 12px;
    color: #334155;
    border-bottom: 1px solid #f1f5f9;
}
.clickable-row {
    cursor: pointer;
    transition: background-color 0.2s;
}
.clickable-row:hover {
    background-color: #f8fafc;
}
.empty-msg {
    padding: 40px !important;
    color: #94a3b8 !important;
}
.status-text {
    font-weight: 600;
    color: #3b82f6;
}
</style>
