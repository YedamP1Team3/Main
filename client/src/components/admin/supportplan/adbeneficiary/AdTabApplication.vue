<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import { useSurveyStore } from '@/stores/useSurveyStore';
// ⭐️ 1. 방금 만든 모달 컴포넌트 가져오기
import ManagerAssignModal from './ManagerAssignModal.vue';

const props = defineProps({
    beneId: { type: [String, Number] }
});

const emit = defineEmits(['select-app', 'assign-manager']); // ⭐️ 이벤트 추가

const assignManager = () => {
    if (!props.beneId) {
        alert('지원 대상자를 먼저 선택해주세요.');
        return;
    }
    if (applicationList.value.length === 0) {
        alert('지원신청서가 1개 이상 작성된 대상자에게만 담당자를 배정할 수 있습니다.');
        return;
    }
    // ⭐️ 모달 띄우는 대신 상위로 이벤트 던지기
    emit('assign-manager');
};

const applicationList = ref([]);
const surveyStore = useSurveyStore();

// ==========================================
// ⭐️ 담당자 배정 모달 상태 및 데이터
// ==========================================
const showManagerModal = ref(false);
const managerList = ref([]);
const beneName = ref('');
const currentManagerName = ref('');

// (임시) 담당자 목록을 DB에서 불러오는 함수
const fetchManagerList = async () => {
    try {
        // TODO: 실제 백엔드의 "role='manager'인 유저 목록" API 주소로 변경하세요.
        // 예: [{ user_id: 'admin_01', user_name: '김담당' }, ...] 형태여야 합니다.
        const res = await axios.get('http://localhost:3000/api/users/managers');
        managerList.value = res.data.data || [];
    } catch (error) {
        console.error('담당자 목록 로드 실패:', error);
    }
};

// ⭐️ 모달에서 '확인'을 누르고 넘어온 이벤트를 처리 (DB 업데이트)
const handleConfirmAssign = async (managerId) => {
    try {
        // TODO: 선택된 managerId를 대상자(bene_id) 정보에 업데이트하는 API 주소로 변경하세요.
        const payload = {
            bene_id: props.beneId,
            manager_id: managerId
        };

        // 예: PUT 요청으로 담당자 수정
        const res = await axios.put(`http://localhost:3000/api/beneficiary/assign`, payload);

        if (res.data.success || res.status === 200) {
            alert('담당자 배정이 성공적으로 완료되었습니다.');
            showManagerModal.value = false; // 모달 닫기

            // TODO: 배정 완료 후, 상단의 '지원자 정보'나 현재 리스트를 새로고침하는 로직 추가
            // await surveyStore.fetchBeneficiaryList();
        } else {
            alert('담당자 배정에 실패했습니다.');
        }
    } catch (error) {
        console.error('담당자 배정 에러:', error);
        alert('서버 통신 중 오류가 발생했습니다.');
    }
};

// ==========================================
// 기존 신청서 목록 조회 로직
// ==========================================
const fetchApplicationList = async (id) => {
    if (!id) {
        applicationList.value = [];
        return;
    }
    try {
        const response = await axios.get(`http://localhost:3000/survey/list/${id}`);
        applicationList.value = response.data.data || [];
    } catch (error) {
        console.error('신청서 목록 로드 실패:', error);
    }
};

const viewApplicationDetail = async (id) => {
    if (!id) return;
    await surveyStore.loadApplicationView(id);
    emit('select-app', id);
};

watch(
    () => props.beneId,
    (newId) => {
        fetchApplicationList(newId);
    },
    { immediate: true }
);
</script>

<template>
    <div class="application-container">
        <!-- 기존 헤더 및 테이블 코드 (변경 없음) -->
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
                    <th>신청일자</th>
                    <th>대기단계</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="applicationList.length === 0">
                    <td colspan="4" class="empty-msg">등록된 지원신청서가 없습니다.</td>
                </tr>
                <tr v-else v-for="app in applicationList" :key="app.id" class="clickable-row" @click="viewApplicationDetail(app.id)">
                    <td>{{ app.id }}</td>
                    <td>{{ app.writer }}</td>
                    <td>{{ app.date }}</td>
                    <td>{{ app.priority_status }}</td>
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
