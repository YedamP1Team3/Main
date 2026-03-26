<script setup>
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSurveyStore, PRIORITY_MAP } from '@/stores/useSurveyStore'; // 💡 한글 번역 맵 추가
import ManagerAssignModal from './ManagerAssignModal.vue';

const props = defineProps({
    beneId: { type: [String, Number] }
});

const emit = defineEmits(['select-app', 'assign-manager']);
const surveyStore = useSurveyStore();

// 💡 스토어에서 신청서 리스트를 직접 가져와 실시간 반응성(Reactivity) 확보
const { application_list } = storeToRefs(surveyStore);

const assignManager = () => {
    if (!props.beneId) {
        alert('지원 대상자를 먼저 선택해주세요.');
        return;
    }
    if (application_list.value.length === 0) {
        alert('지원신청서가 1개 이상 작성된 대상자에게만 담당자를 배정할 수 있습니다.');
        return;
    }
    emit('assign-manager');
};

// 💡 영문을 한글로 번역하는 포맷터 함수 추가
const formatPriority = (item) => {
    if (item.progress_status === 'pending') return '대기';
    if (!item.priority_status) return '미신청';
    const lowerCode = String(item.priority_status).toLowerCase();
    return PRIORITY_MAP[lowerCode] || item.priority_status;
};

const viewApplicationDetail = async (id) => {
    if (!id) return;
    await surveyStore.loadApplicationView(id);
    emit('select-app', id);
};

// 대상자가 바뀔 때 스토어의 리스트 갱신 액션만 호출
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
                    <th>대기단계</th>
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
                    <td class="status-text">{{ formatPriority(app) }}</td>
                    <td>{{ app.date }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<style scoped>
/* 기존 스타일은 그대로 유지합니다 */
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
