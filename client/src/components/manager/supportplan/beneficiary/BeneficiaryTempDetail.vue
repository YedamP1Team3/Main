<script setup>
import axios from 'axios';
import { ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const emit = defineEmits(['refresh']);
const props = defineProps({
    beneId: [String, Number],
    priorityId: [String, Number],
    planId: [String, Number]
});

const tempDetail = ref({});

// 1. 상세 정보
const fetchTempDetail = async (id) => {
    if (!id) return;
    try {
        const response = await axios.get(`api/api/temp-plans/${id}`);
        tempDetail.value = response.data;
    } catch (error) {
        console.error(`에러`, error);
    }
};

// 2. 삭제 (임시/대기 상태일 때만)
const DeleteTemp = async (planDraftId) => {
    if (!confirm('삭제하시겠습니까?')) return;
    try {
        const response = await axios.delete(`http://localhost:3000/api/temp-plans/${planDraftId}`);
        if (response.data.status == 'success') {
            alert('삭제되었습니다');
            emit('refresh');
        } else {
            alert('임시파일만 삭제가 가능합니다');
        }
    } catch (error) {
        console.error('삭제중 오류 발생', error);
    }
};

// 3. 승인 신청 (수정 후 재신청)
const Approval = async (planDraftId) => {
    if (!confirm('수정한 내용으로 승인을 신청하시겠습니까?')) return;
    const target = {
        priority_id: props.priorityId,
        manager_id: authStore.userId,
        bene_id: props.beneId,
        plan_objective: tempDetail.value.plan_objective,
        plan_content: tempDetail.value.plan_content,
        progress_state: '대기',
        // 💡 삭제를 위해 임시 ID를 추가로 보냅니다.
        plan_draft_id: tempDetail.value.plan_draft_id
    };

    try {
        const response = await axios.post(`api/api/temp-plans/approve`, target);
        if (response.data.status === 'success') {
            alert('승인 신청되었습니다.');
            emit('refresh');
        }
    } catch (error) {
        console.error('오류 발생', error);
    }
};

// 4. 임시 저장
const SaveTemp = async (planDraftId) => {
    if (!confirm('내용을 저장하시겠습니까?')) return;
    try {
        const updateData = {
            plan_objective: tempDetail.value.plan_objective,
            plan_content: tempDetail.value.plan_content
        };
        const response = await axios.put(`http://localhost:3000/api/temp-plans/${planDraftId}`, updateData);
        if (response.data.status == true) {
            alert('임시저장되었습니다');
            emit('refresh');
        }
    } catch (error) {
        console.error('오류 발생', error);
    }
};

watch(
    () => props.planId,
    (newId) => {
        fetchTempDetail(newId);
    },
    { immediate: true }
);
</script>
<template>
    <div class="BfnewPlan">
        <h2>지원계획서 임시조회</h2>
        <hr class="main-hr" />

        <div class="info-row-top">
            <div class="status-box">
                <span>상태: {{ tempDetail.progress_state }}</span>
            </div>
            <div class="date-box"><strong>작성일 :</strong> {{ tempDetail.created_at }}</div>
        </div>

        <div class="table-container">
            <div class="form-row">
                <label for="objective">지원목표</label>
                <div class="input-wrapper">
                    <input id="objective" v-model="tempDetail.plan_objective" :readonly="!['임시', '반려'].includes(tempDetail.progress_state)" type="text" class="content-input" />
                </div>
            </div>
            <div class="form-row">
                <label for="content">계획내용</label>
                <div class="input-wrapper">
                    <textarea id="content" v-model="tempDetail.plan_content" rows="8" :readonly="!['임시', '반려'].includes(tempDetail.progress_state)" class="content-textarea"></textarea>
                </div>
            </div>
            <div class="form-row">
                <label>파일첨부</label>
                <div class="input-wrapper">
                    <input type="text" placeholder="첨부된 파일이 없습니다." readonly class="content-input gray-bg" />
                </div>
            </div>
        </div>

        <div class="button-group">
            <button class="btn-approve" @click="Approval(tempDetail.plan_draft_id)">승인 신청</button>
            <button class="btn-temp" @click="SaveTemp(tempDetail.plan_draft_id)">임시 저장</button>
            <button class="btn-delete" @click="DeleteTemp(tempDetail.plan_draft_id)">삭제</button>
        </div>
    </div>
</template>

<style scoped>
/* 전체 컨테이너 */
.BfnewPlan {
    max-width: 900px;
    margin: 0 auto;
    padding: 30px;
    background-color: #ffffff;
}

.main-hr {
    border: none;
    border-top: 2px solid #334155;
    margin-bottom: 15px;
}

/* 상단 정보 라인 (작성일 우측 정렬) */
.info-row-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.date-box {
    font-size: 0.95rem;
    color: #475569;
}

/* 상태 배지 */
.state-badge {
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: bold;
}
.state-badge.임시 {
    background: #f1f5f9;
    color: #475569;
}
.state-badge.반려 {
    background: #fee2e2;
    color: #dc2626;
}
.state-badge.대기 {
    background: #fef3c7;
    color: #d97706;
}
.state-badge.승인 {
    background: #dcfce7;
    color: #16a34a;
}

/* 폼 테이블 박스 (관리자와 동일) */
.table-container {
    border: 1px solid #e2e8f0;
}

.form-row {
    display: flex;
    border-bottom: 1px solid #e2e8f0;
}

.form-row:last-child {
    border-bottom: none;
}

.form-row label {
    width: 140px;
    min-width: 140px;
    background-color: #f8fafc;
    color: #475569;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    border-right: 1px solid #e2e8f0;
}

.input-wrapper {
    flex: 1;
    display: flex;
}

.content-input,
.content-textarea {
    width: 100%;
    border: none;
    padding: 15px;
    outline: none;
    font-size: 1rem;
    font-family: inherit;
    color: #1e293b;
}

.content-textarea {
    resize: none;
    line-height: 1.6;
}

/* 읽기 전용일 때 배경색 처리 */
input[readonly],
textarea[readonly] {
    background-color: #ffffff;
}

/* 수정 불가능한 상태에서 강조를 빼고 싶을 때 사용하는 클래스 (선택 사항) */
.gray-bg {
    background-color: #f9fafb !important;
}

/* 버튼 그룹 (알약 모양) */
.button-group {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 30px;
}

.button-group button {
    padding: 10px 25px;
    border-radius: 30px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    border: none;
    transition: 0.2s;
}

.btn-approve {
    background-color: #1e293b;
    color: #ffffff;
}
.btn-temp {
    background-color: #64748b;
    color: #ffffff;
}
.btn-delete {
    background-color: #ffffff;
    color: #e11d48;
    border: 1px solid #e11d48 !important;
}

button:hover {
    opacity: 0.8;
    transform: translateY(-1px);
}

/* 반려 히스토리 섹션 (관리자용 디자인 계승) */
.history-section {
    margin-top: 50px;
}

.history-title {
    font-size: 1.2rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 15px;
}

.history-card {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 18px;
    margin-bottom: 12px;
}

.history-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    border-bottom: 1px dashed #cbd5e1;
    padding-bottom: 8px;
}

.history-user {
    font-weight: 700;
    color: #475569;
    font-size: 0.9rem;
}

.history-date {
    font-size: 0.85rem;
    color: #94a3b8;
}

.history-body {
    color: #334155;
    line-height: 1.6;
    font-size: 0.95rem;
    white-space: pre-wrap;
}
</style>
