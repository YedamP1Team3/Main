<script setup>
import axios from 'axios';
import { ref, watch, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const emit = defineEmits(['refresh', 'select-sub-plan']);
const props = defineProps({
    beneId: [String, Number],
    priorityId: [String, Number],
    resultId: [String, Number]
});

const resultDetail = ref({});
const rejectionLog = ref([]);
const selectedPlans = ref([]);

const supportList = ref([]);
const supportPlan = ref('');

// 1. 상세 정보 및 반려 히스토리 가져오기
const fetchResultDetail = async (id) => {
    if (!id) return;
    try {
        const response = await axios.get(`api/resultPlan/temp-result/${id}`);
        resultDetail.value = response.data;
        selectedPlans.value = response.data.selected_plans || [];
    } catch (error) {
        console.error(`에러`, error);
    }
};

const fetchAllSupportList = async () => {
    if (!props.beneId) return;
    try {
        const response = await axios.get(`api/resultPlan/support-plans/approved/${props.beneId}`);
        supportList.value = response.data;
    } catch (error) {
        console.error('목록 로드 실패', error);
    }
};

const fetchRejectionHistory = async (id) => {
    if (!id) return;
    try {
        // 관리자용 API를 그대로 사용하여 해당 결과서의 이력을 가져옵니다.
        const response = await axios.get(`api/adsupport/admin/support-result/${id}/rejection-history`);
        // 데이터가 배열인지 확인 후 저장합니다.
        rejectionLog.value = Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('이력 조회 실패', error);
        rejectionLog.value = [];
    }
};

const Plus = () => {
    if (!supportPlan.value) {
        alert('계획을 선택해주세요');
        return;
    }
    const isExist = selectedPlans.value.some((p) => p.plan_id === supportPlan.value);
    if (isExist) {
        alert('이미 추가된 계획입니다');
        return;
    }
    const target = supportList.value.find((p) => p.plan_id === supportPlan.value);
    if (target) {
        selectedPlans.value.push(target);
        supportPlan.value = '';
    }
};

const removePlan = (id) => {
    selectedPlans.value = selectedPlans.value.filter((p) => p.plan_id !== id);
};

const selectSubPlan = (planId) => {
    if (!planId) return;
    emit('select-sub-plan', planId);
};

//2. 삭제 (임시/대기 상태일 때만)
const deleteTemp = async (resultId) => {
    if (!confirm('삭제하시겠습니까?')) return;
    try {
        const response = await axios.delete(`api/resultPlan/temp-result/${resultId}`);
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
const Approval = async (id) => {
    if (!confirm('수정한 내용으로 승인을 신청하시겠습니까?')) return;
    if (selectedPlans.value.length === 0) {
        alert('연결된 지원계획서가 없습니다. 결과에 포함할 계획을 선택해주세요.');
        return;
    }
    try {
        const planIds = selectedPlans.value.map((plan) => plan.plan_id);
        const target = {
            manager_id: authStore.userId,
            bene_id: props.beneId,
            result_title: resultDetail.value.result_title,
            result_content: resultDetail.value.result_content,
            planIds: planIds
        };
        const response = await axios.post(`api/resultPlan/temp-result/${id}/apply`, target);
        if (response.data.status === 'success') {
            alert('승인 신청되었습니다.');
            emit('refresh');
        } else {
            alert('처리 중 오류가 발생했습니다.');
        }
    } catch (error) {
        console.error('오류 발생', error);
    }
};

// 4. 임시 저장
const SaveTemp = async (id) => {
    if (!confirm('수정한 내용으로 승인을 신청하시겠습니까?')) return;
    try {
        const planIds = selectedPlans.value.map((plan) => plan.plan_id);
        const updateData = {
            result_title: resultDetail.value.result_title,
            result_content: resultDetail.value.result_content,
            planIds: planIds
        };
        const response = await axios.put(`http://localhost:3000/resultPlan/support-result/${id}/temp`, updateData);
        if (response.data.status === 'success') {
            alert('임시저장되었습니다');
            emit('refresh');
        } else {
            alert('처리 중 오류가 발생했습니다.');
        }
    } catch (error) {
        console.error('오류 발생', error);
    }
};

watch(
    () => props.resultId,
    (newId) => {
        fetchResultDetail(newId);
        fetchAllSupportList();
        fetchRejectionHistory(newId);
    },
    { immediate: true }
);

onMounted(() => {
    if (props.beneId) fetchAllSupportList();
});
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

            <div v-if="['임시', '반려'].includes(resultDetail.progress_state)" class="form-row">
                <label>계획서 추가</label>
                <div class="input-wrapper">
                    <div class="select-group-inline">
                        <select v-model="supportPlan" class="custom-select-small">
                            <option value="">계획서를 선택하세요</option>
                            <option v-for="plan in supportList" :key="plan.plan_id" :value="plan.plan_id">
                                {{ plan.plan_objective }}
                            </option>
                        </select>
                        <button type="button" class="btn-plus-small" @click="Plus">+</button>
                    </div>
                </div>
            </div>

            <div class="form-row">
                <label>선택된 계획</label>
                <div class="input-wrapper plan-tags">
                    <div v-if="selectedPlans.length === 0" class="no-data">연결된 계획서가 없습니다.</div>

                    <div v-for="plan in selectedPlans" :key="plan.plan_id" class="plan-tag-item" @click="selectSubPlan(plan.plan_id)">
                        <span>{{ plan.plan_objective }}</span>
                        <button v-if="['임시', '반려'].includes(resultDetail.progress_state)" type="button" class="btn-remove-tag" @click.stop="removePlan(plan.plan_id)">X</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="button-group">
            <button v-if="['임시', '반려'].includes(resultDetail.progress_state)" class="btn-approve" @click="Approval(resultDetail.result_id)">승인 신청</button>
            <button v-if="['임시', '반려'].includes(resultDetail.progress_state)" class="btn-temp" @click="SaveTemp(resultDetail.result_id)">임시 저장</button>
            <button v-if="['임시', '대기'].includes(resultDetail.progress_state) && rejectionLog.length === 0" class="btn-delete" @click="deleteTemp(resultDetail.result_id)">삭제</button>
        </div>

        <div v-if="rejectionLog.length > 0" class="history-section">
            <h3 class="history-title">반려 사유 목록</h3>
            <div class="history-list">
                <div v-for="(log, index) in rejectionLog" :key="index" class="history-card">
                    <div class="history-header">
                        <span class="history-user">검토자: {{ log.manager_name }}</span>
                        <span class="history-date">{{ log.created_at }}</span>
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

/* 반려 이력 */
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
