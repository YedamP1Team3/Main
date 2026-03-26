<script setup>
import axios from 'axios';
import { ref, watch } from 'vue';
const emit = defineEmits(['refresh']);

const props = defineProps({ beneId: [String, Number], priorityId: [String, Number], planId: [String, Number] });

const planDetail = ref({});
const reasoninsert = ref(false);
const rejectReason = ref('');
const rejectionLog = ref([]);

const fetchPlanDetail = async (id) => {
    if (!id) return;
    try {
        const response = await axios.get(`http://localhost:3000/adsupport/AdDetailSupportPlan/${id}`);
        planDetail.value = response.data;
        rejectReason.value = '';
        reasoninsert.value = false;
        fetchRejectionHistory(id);
    } catch (error) {
        console.error(`에러`, error);
    }
};

const fetchRejectionHistory = async (id) => {
    try {
        const response = await axios.get(`http://localhost:3000/adsupport/rejectionList/${id}`);
        rejectionLog.value = response.data;
    } catch (error) {
        console.error('이력 조회 실패', error);
    }
};

const startReject = () => {
    reasoninsert.value = true;
    rejectReason.value = '';
};

const Approval = async (planId) => {
    if (!confirm('수정하시겠습니까?')) return;
    try {
        const response = await axios.put(`http://localhost:3000/adsupport/ApprovalChange/${planId}`);
        if (response.data.status == true) {
            alert('승인신청했습니다');
            emit('refresh');
        } else {
            alert('승인이 신청되지 못했습니다');
        }
    } catch (error) {
        console.error('삭제중 오류 발생', error);
        alert('통신오류');
    }
};

const updatereturn = async (planId) => {
    if (!rejectReason.value.trim()) {
        alert('반려 사유를 입력해주세요.');
        return;
    }
    if (!confirm('반려하시겠습니까?')) return;
    try {
        const updateRes = await axios.put(`http://localhost:3000/adsupport/Return/${planId}`);
        if (updateRes.data.status) {
            const historyData = {
                plan_id: planId,
                rejection_reason: rejectReason.value,
                manager_id: 'admin_test'
            };
            await axios.post(`http://localhost:3000/adsupport/rejectionHistory`, historyData);

            alert('반려 처리 및 이력이 저장되었습니다.');
            reasoninsert.value = false;
            emit('refresh');
            fetchRejectionHistory(planId);
        }
    } catch (error) {
        console.error('반려 처리 중 오류', error);
        alert('통신 오류가 발생했습니다.');
    }
};

watch(
    () => props.planId,
    (newId) => {
        fetchPlanDetail(newId);
        reasoninsert.value = false;
    },
    { immediate: true }
);
</script>
<template>
    <div class="BfnewPlan">
        <h2>지원계획서 승인여부</h2>
        <hr class="main-hr" />

        <div class="author-row"><strong>작성자 : </strong> {{ planDetail.manager_name }}</div>

        <div class="status-row">
            <span :class="['state-badge', planDetail.progress_state]"> 상태: {{ planDetail.progress_state }} </span>
        </div>

        <div class="table-container">
            <div class="form-row">
                <label>지원목표</label>
                <div class="content-box">{{ planDetail.plan_objective }}</div>
            </div>
            <div class="form-row">
                <label>계획내용</label>
                <div class="content-box text-area">{{ planDetail.plan_content }}</div>
            </div>
        </div>

        <div class="button-group">
            <button v-if="planDetail.progress_state === '대기'" class="btn-approve" @click="Approval(planDetail.plan_id)">승인</button>
            <button v-if="planDetail.progress_state === '대기' && !reasoninsert" class="btn-reject" @click="reasoninsert = true">반려하기</button>
        </div>

        <div v-if="reasoninsert" class="reason-input-area">
            <p class="reason-label">반려 사유 입력</p>
            <textarea v-model="rejectReason" placeholder="사유를 입력하세요..."></textarea>
            <button class="btn-submit-reject" @click="updatereturn(planDetail.plan_id)">반려 확정</button>
        </div>

        <div v-if="rejectionLog.length > 0" class="history-section">
            <h3>반려 내용</h3>
            <div v-for="(log, index) in rejectionLog" :key="index" class="history-card">
                <div class="history-header">
                    <span class="history-user">검토자: {{ log.manager_name }}</span>
                    <span class="history-date">{{ log.created_at }}</span>
                </div>
                <div class="history-body"><strong>사유:</strong> {{ log.rejection_reason }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 전체 레이아웃 */
.BfnewPlan {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
    background: #fff;
}

.main-hr {
    border: none;
    border-top: 2px solid #334155;
    margin-bottom: 15px;
}

/* 작성자 우측 정렬 */
.author-row {
    text-align: right;
    font-size: 0.95rem;
    color: #475569;
    margin-bottom: 10px;
}

/* 상태 배지 */
.status-row {
    margin-bottom: 15px;
}
.state-badge {
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: bold;
}
.state-badge.대기 {
    background: #fef3c7;
    color: #d97706;
}
.state-badge.반려 {
    background: #fee2e2;
    color: #dc2626;
}

/* 폼 박스 (테두리 수정 핵심) */
.table-container {
    border: 1px solid #e2e8f0; /* 전체 외곽선 */
}

.form-row {
    display: flex;
    border-bottom: 1px solid #e2e8f0;
}

.form-row:last-child {
    border-bottom: none; /* 마지막 줄 바닥선 중복 제거 */
}

.form-row label {
    width: 140px;
    background: #f8fafc;
    padding: 20px;
    font-weight: bold;
    color: #475569;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid #e2e8f0;
}

.content-box {
    flex: 1;
    padding: 15px;
    color: #1e293b;
    word-break: break-all;
}

.text-area {
    min-height: 150px;
    white-space: pre-wrap;
}

/* 버튼 스타일 */
.button-group {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}

.button-group button {
    padding: 10px 25px;
    border-radius: 30px;
    font-weight: bold;
    cursor: pointer;
    border: none;
}

.btn-approve {
    background: #1e293b;
    color: #fff;
}
.btn-reject {
    background: #fff;
    color: #e11d48;
    border: 1px solid #e11d48 !important;
}

/* 반려 입력 영역 */
.reason-input-area {
    margin-top: 30px;
    padding: 20px;
    background: #ffffff;
    border-radius: 10px;
}

.reason-label {
    color: #e11d48;
    font-weight: bold;
    margin-bottom: 10px;
}

.reason-input-area textarea {
    width: 100%;
    height: 100px;
    padding: 10px;
    border: 1px solid #fda4af;
    border-radius: 5px;
    resize: none;
}

.btn-submit-reject {
    background: #e11d48;
    color: #fff;
    padding: 8px 20px;
    border-radius: 20px;
    border: none;
    float: right;
    margin-top: 10px;
    cursor: pointer;
}

/* 히스토리 섹션 */
.history-section {
    margin-top: 50px;
}
.history-section h3 {
    font-size: 1.2rem;
    margin-bottom: 15px;
}

.history-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 10px;
}

.history-header {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px dashed #cbd5e1;
    padding-bottom: 5px;
    margin-bottom: 10px;
    font-size: 0.85rem;
}

.history-user {
    font-weight: bold;
    color: #475569;
}
.history-date {
    color: #94a3b8;
}
.history-body {
    font-size: 0.95rem;
    line-height: 1.5;
}
</style>
