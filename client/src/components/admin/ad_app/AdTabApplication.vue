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
                    <th>NO</th>
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

/* MemberManagement.vue의 헤더(content-header)와 동일한 레이아웃 */
.header-row {
    display: flex;
    align-items: center;
    gap: 15px; /* 제목과 버튼을 가깝게 밀착 */
    margin-bottom: 20px;
    justify-content: flex-start; /* 양끝 정렬(space-between) 해제하고 왼쪽 정렬 */
}

h2 {
    margin: 0;
    font-size: 1.1rem; /* h3 사이즈로 축소하여 탭과 조화롭게 변경 */
    color: #1e293b;
    font-weight: bold;
}

.btn-group {
    display: flex;
    align-items: center;
}

/* MemberManagement.vue의 추가 버튼(btn-add)과 완벽히 동일한 스타일 */
.btn-assign {
    padding: 4px 10px;
    font-size: 0.8rem;
    color: #fff;
    background-color: #ffab91;
    border: 1px solid #f4e2de;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: background-color 0.2s;
}

.btn-assign i {
    font-size: 0.8rem; /* 아이콘 크기도 폰트에 맞게 조절 */
}

.btn-assign:hover {
    background-color: #ff8a65;
}

/* MemberManagement.vue의 테이블(list-table)과 완벽히 동일한 스타일 */
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

.clickable-row {
    cursor: pointer;
    transition: background-color 0.2s;
}

.clickable-row:hover {
    background-color: #f8fafc;
}

.empty-msg {
    padding: 30px !important;
    color: #94a3b8 !important;
    text-align: center;
}

.status-text {
    font-weight: 600;
    color: #ffab91;
}
</style>
