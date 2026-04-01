<script setup>
import axios from 'axios';
import { ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';

const emit = defineEmits(['refresh', 'select-sub-plan']);
const props = defineProps({
    beneId: [String, Number],
    priorityId: [String, Number],
    resultId: [String, Number]
});

const authStore = useAuthStore();

const resultDetail = ref({});
const rejectionLog = ref([]); // 반려 히스토리 저장용
const selectedPlans = ref([]); //연결된 지원계획서 목록 저장용

const supportList = ref([]);
const supportPlan = ref('');

const reasoninsert = ref(false);
const rejectReason = ref('');

// 1. 상세 정보 및 반려 히스토리 가져오기
const fetchResultDetail = async (id) => {
    if (!id) return;
    try {
        const response = await axios.get(`http://localhost:3000/adsupport/admin/support-result/${id}`);
        resultDetail.value = response.data;
        selectedPlans.value = response.data.selected_plans || []; // ✅ 계획서 목록 추출
        fetchRejectionHistory(id);
    } catch (error) {
        console.error(`에러`, error);
    }
};
// 수정사항;
const fetchRejectionHistory = async (id) => {
    try {
        const response = await axios.get(`http://localhost:3000/adsupport/admin/support-result/${id}/rejection-history`);
        rejectionLog.value = Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('이력 조회 실패', error);
    }
};

const startReject = () => {
    reasoninsert.value = true;
    rejectReason.value = '';
};

// 3. 승인 신청 (수정 후 재신청)
const Approval = async (resultId) => {
    if (!confirm('승인하시겠습니까?')) return;
    try {
        const response = await axios.put(`http://localhost:3000/adsupport/admin/support-result/${resultId}/approval`);
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

const selectSubPlan = (planId) => {
    if (!planId) return;
    emit('select-sub-plan', planId);
};

// 4. 반려사항
const updateReturn = async (resultId) => {
    if (!rejectReason.value.trim()) {
        alert('반려 사유를 입력해주세요.');
        return;
    }
    if (!confirm('반려하시겠습니까?')) return;
    try {
        const updateRes = await axios.put(`http://localhost:3000/adsupport/admin/support-result/${resultId}/return`);
        if (updateRes.data.status) {
            const historyData = {
                result_id: resultId,
                rejection_reason: rejectReason.value,
                manager_id: authStore.userId
            };
            await axios.post(`http://localhost:3000/adsupport/admin/support-result/rejection-history`, historyData);

            alert('반려 처리 및 이력이 저장되었습니다.');
            reasoninsert.value = false;
            emit('refresh');
            fetchRejectionHistory(resultId);
        }
    } catch (error) {
        console.error('반려 처리 중 오류', error);
        alert('통신 오류가 발생했습니다.');
    }
};

watch(
    () => props.resultId,
    (newId) => {
        if (newId) {
            reasoninsert.value = false; // 창 닫기
            rejectReason.value = ''; // 글자 비우기
            fetchResultDetail(newId);
        }
    },
    { immediate: true }
);
</script>
<template>
    <div class="BfnewPlan">
        <h2>지원결과서 조회</h2>
        <hr class="main-hr" />

        <div class="info-row-top">
            <div class="status-box">
                <span :class="['state-badge', resultDetail.progress_state]"> 상태: {{ resultDetail?.progress_state }} </span>
            </div>
            <div class="date-box"><strong>작성일 :</strong> {{ resultDetail.created_at }}</div>
        </div>

        <div class="table-container">
            <div class="form-row">
                <label for="objective">지원목표</label>
                <div class="input-wrapper">
                    <input id="objective" v-model="resultDetail.result_title" :readonly="!['임시', '반려'].includes(resultDetail.progress_state)" type="text" class="content-input" />
                </div>
            </div>

            <div class="form-row">
                <label for="content">계획내용</label>
                <div class="input-wrapper">
                    <textarea id="content" v-model="resultDetail.result_content" rows="8" :readonly="!['임시', '반려'].includes(resultDetail.progress_state)" class="content-textarea"></textarea>
                </div>
            </div>

            <div class="form-row">
                <label>파일첨부</label>
                <div class="input-wrapper">
                    <input type="text" placeholder="첨부된 파일이 없습니다." readonly class="content-input gray-bg" />
                </div>
            </div>
            <div class="form-row">
                <label>선택된 계획</label>
                <div class="input-wrapper plan-tags">
                    <div v-if="selectedPlans.length === 0" class="no-data">연결된 계획서가 없습니다.</div>

                    <div v-for="plan in selectedPlans" :key="plan.plan_id" class="plan-tag-item" @click="selectSubPlan(plan.plan_id)">
                        <span>{{ plan.plan_objective }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="button-group">
            <button v-if="['반려/재승인', '대기'].includes(resultDetail.progress_state)" class="btn-approve" @click="Approval(resultDetail.result_id)">승인</button>
            <button v-if="['반려/재승인', '대기'].includes(resultDetail.progress_state)" class="btn-reject" @click="reasoninsert = true">반려하기</button>
        </div>

        <div v-if="reasoninsert" class="reason-input-area">
            <p class="reason-label">반려 사유 입력</p>
            <textarea v-model="rejectReason" placeholder="사유를 입력하세요..."></textarea>
            <button class="btn-submit-reject" @click="updateReturn(resultDetail.result_id)">반려 확정</button>
        </div>

        <div v-if="rejectionLog.length > 0" class="history-section">
            <h3 class="history-title">반려 사유 목록</h3>
            <div class="history-list">
                <div v-for="log in rejectionLog" :key="index" class="history-card">
                    <div class="history-header">
                        <span class="history-user">검토자: {{ log.manager_name }}</span>
                        <span class="history-date">작성일: {{ log.created_at }}</span>
                    </div>
                    <div class="history-body"><strong>사유:</strong> {{ log.rejection_reason }}</div>
                </div>
            </div>
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
h2 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 8px;
}
.main-hr {
    border: 0;
    height: 2px;
    background: #334155;
    margin: 15px 0 20px 0;
}

/* 상단 상태 바 */
.info-row-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
.state-badge {
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 0.85rem;
    font-weight: bold;
}
.state-badge.임시 {
    background-color: #f1f5f9;
    color: #64748b;
}
.state-badge.대기 {
    background-color: #fef3c7;
    color: #d97706;
}
.state-badge.반려 {
    background-color: #fee2e2;
    color: #ef4444;
}
.date-box {
    color: #64748b;
    font-size: 0.95rem;
}

/* 표 레이아웃 */
.table-container {
    border-top: 1px solid #e2e8f0;
}
.form-row {
    display: flex;
    border-bottom: 1px solid #e2e8f0;
    border-left: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
}
.form-row label {
    width: 140px;
    background-color: #f8fafc;
    color: #475569;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    border-right: 1px solid #e2e8f0;
    font-size: 0.9rem;
    flex-shrink: 0;
}
.input-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
}

/* 입력 필드 */
.content-input,
.content-textarea,
.custom-select-small {
    width: 100%;
    border: none;
    padding: 15px 20px;
    font-size: 1rem;
    color: #334155;
    outline: none;
    background: transparent;
}
.content-textarea {
    min-height: 180px;
    line-height: 1.6;
    resize: none;
}
.gray-bg {
    background-color: #f8fafc !important;
}

/* 계획서 태그 및 추가 */
.plan-tags {
    padding: 10px 20px;
    flex-wrap: wrap;
    gap: 10px;
}
.select-group-inline {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    width: 100%;
}
.btn-plus-small {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    border: 1px solid #1e293b;
    background: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}
.plan-tag-item {
    display: flex;
    align-items: center;
    background: #eff6ff;
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 0.85rem;
    color: #1e40af;
    border: 1px solid #dbeafe;
    cursor: pointer;
    margin-right: 5px;
}
.active-tag {
    background-color: #1e293b !important;
    color: #fff !important;
}
.btn-remove-tag {
    margin-left: 8px;
    border: none;
    background: none;
    color: #ef4444;
    font-weight: bold;
    cursor: pointer;
}

/* 하단 버튼 (우측 정렬) */
.button-group {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 30px;
}
.btn-approve {
    padding: 12px 40px;
    background: #fff;
    color: #1e293b;
    border: 1.5px solid #1e293b;
    border-radius: 30px;
    font-weight: 800;
    cursor: pointer;
}
.btn-temp,
.btn-delete {
    padding: 12px 24px;
    background: #f1f5f9;
    color: #64748b;
    border: none;
    border-radius: 30px;
    font-weight: 600;
    cursor: pointer;
}
.btn-delete {
    color: #ef4444;
}

/* //반려 이력 */
.history-section {
    margin-top: 40px;
    border-top: 1px solid #e2e8f0;
    padding-top: 20px;
}
.history-card {
    background: #fff1f2;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #fecdd3;
    margin-bottom: 10px;
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
