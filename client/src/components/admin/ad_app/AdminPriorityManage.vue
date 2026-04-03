<script setup>
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useSurveyStore, PRIORITY_MAP } from '@/stores/useSurveyStore';
import axios from 'axios';

const emit = defineEmits(['close', 'refresh']);

const authStore = useAuthStore();
const surveyStore = useSurveyStore();

const isAdmin = computed(() => authStore.userRole?.toLowerCase() === 'admin');
const targetBeneId = computed(() => surveyStore.selected_bene_id);
const beneName = computed(() => surveyStore.selected_bene_detail?.bene_name || '지원대상자');
const currentStatus = computed(() => surveyStore.priority_data.progress_status || 'none');

const rejectReasonInput = ref('');
const isRejecting = ref(false);
const rejectHistoryList = ref([]);

const requestedStage = computed(() => {
    const priorityCode = surveyStore.priority_data.priority_status;

    if (!priorityCode || priorityCode === 'none') {
        return '요청 없음';
    }

    return PRIORITY_MAP[String(priorityCode).toLowerCase()] || priorityCode;
});

const fetchRejectHistory = async () => {
    if (!targetBeneId.value) {
        rejectHistoryList.value = [];
        return;
    }

    try {
        const response = await axios.get(`/api/abc/admin/priority/reject-history/${targetBeneId.value}`);
        rejectHistoryList.value = response.data?.success ? response.data.data || [] : [];
    } catch (error) {
        console.error('반려 이력 조회 실패:', error);
        rejectHistoryList.value = [];
    }
};

watch(
    () => targetBeneId.value,
    async () => {
        // 대상자가 바뀌면 이전 대상자의 반려 입력 상태와 이력을 비워야
        // 모달 안에 잘못된 데이터가 남지 않는다.
        rejectReasonInput.value = '';
        isRejecting.value = false;
        await fetchRejectHistory();
    },
    { immediate: true }
);

const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const refreshPriorityState = async () => {
    if (!targetBeneId.value) {
        return;
    }

    // 승인/반려 후에는 최신 priority 상태와 과거 반려 이력이 같이 바뀔 수 있다.
    // 둘을 같이 새로 읽어야 상단 상태 카드와 하단 히스토리가 엇갈리지 않는다.
    await Promise.all([surveyStore.fetchPriorityInfo(targetBeneId.value), fetchRejectHistory()]);
};

const handleApprove = async () => {
    if (!confirm(`${beneName.value}의 대기단계를 승인하시겠습니까?`)) {
        return;
    }

    try {
        await axios.post('/api/abc/admin/priority/approve', {
            bene_id: targetBeneId.value
        });

        alert('승인이 완료되었습니다.');
        await refreshPriorityState();
        emit('refresh');
    } catch (error) {
        console.error('대기단계 승인 실패:', error);
        alert('승인 처리 중 오류가 발생했습니다.');
    }
};

const handleReject = async () => {
    if (!rejectReasonInput.value.trim()) {
        alert('반려 사유를 입력해주세요.');
        return;
    }

    if (!confirm('반려하시겠습니까?')) {
        return;
    }

    try {
        await axios.post('/api/abc/admin/priority/reject', {
            bene_id: targetBeneId.value,
            reason: rejectReasonInput.value
        });

        alert('반려 처리되었습니다.');
        isRejecting.value = false;
        rejectReasonInput.value = '';
        await refreshPriorityState();
        emit('refresh');
    } catch (error) {
        console.error('대기단계 반려 실패:', error);
        alert('반려 처리 중 오류가 발생했습니다.');
    }
};
</script>

<template>
    <div v-if="isAdmin" class="priority-manage-container">
        <h2 class="title">{{ beneName }}의 대기단계 관리</h2>

        <div v-if="currentStatus === 'pending'" class="action-area">
            <div class="summary-card">
                <div class="summary-row">
                    <span class="info-label">현재 상태</span>
                    <span class="status-badge pending">승인 대기중</span>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-row">
                    <span class="info-label">요청 단계</span>
                    <span class="info-value">{{ requestedStage }}</span>
                </div>
            </div>

            <div v-if="!isRejecting" class="action-buttons">
                <button class="btn-approve" @click="handleApprove">승인하기</button>
                <button class="btn-reject" @click="isRejecting = true">반려하기</button>
                <button class="btn-cancel" @click="emit('close')">닫기</button>
            </div>

            <div v-if="isRejecting" class="reject-form">
                <h3>반려 사유 작성</h3>
                <textarea v-model="rejectReasonInput" placeholder="반려 사유를 구체적으로 적어주세요." rows="4"></textarea>
                <div class="form-actions">
                    <button class="btn-submit-reject" @click="handleReject">반려 완료</button>
                    <button class="btn-cancel" @click="isRejecting = false">취소</button>
                </div>
            </div>

            <div v-if="rejectHistoryList.length > 0" class="history-section">
                <h4 class="history-title"><i class="pi pi-history"></i> 과거 반려 이력</h4>
                <div class="timeline">
                    <div v-for="item in rejectHistoryList" :key="item.priority_id" class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div class="timeline-content">
                            <span class="timeline-date">{{ formatDate(item.approval_date) }}</span>
                            <span class="stage-tag">{{ PRIORITY_MAP[item.priority_status] || item.priority_status }} 단계 요청</span>
                            <p class="timeline-reason">{{ item.rejection_reason }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else-if="currentStatus === 'none'" class="info-area">
            <i class="pi pi-info-circle"></i>
            <p>아직 대기단계 승인 요청이 접수되지 않았습니다.</p>
            <button class="btn-cancel mt-3" @click="emit('close')">닫기</button>
        </div>

        <div v-else-if="currentStatus === 'approved'" class="info-area">
            <i class="pi pi-check-circle text-green"></i>
            <p>이미 <strong>승인 완료</strong>된 상태입니다.</p>
            <button class="btn-cancel mt-3" @click="emit('close')">닫기</button>
        </div>

        <div v-else-if="currentStatus === 'rejected'" class="info-area">
            <i class="pi pi-times-circle text-red"></i>
            <p>현재 <strong>반려</strong> 상태입니다. 대상자의 재신청을 기다려주세요.</p>
            <button class="btn-cancel mt-3" @click="emit('close')">닫기</button>
        </div>
    </div>
</template>

<style scoped>
.priority-manage-container {
    padding: 40px;
    background-color: #fef9f6;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
}

.title {
    font-size: 1.6rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 20px;
}

.action-area {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
}

.summary-card {
    background-color: #fff;
    border: 2px solid #f4e2de;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 30px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: transparent;
}

.summary-divider {
    height: 2px;
    background-color: #f4e2de;
    margin: 15px 0;
}

.info-label {
    font-size: 1rem;
    color: #ffab91;
    font-weight: 700;
}

.info-value {
    font-size: 1.2rem;
    font-weight: 800;
    color: #1e293b;
}

.status-badge.pending {
    background-color: #ffab91;
    color: #fff;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 700;
    box-shadow: 0 2px 4px rgba(255, 171, 145, 0.3);
}

.action-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
}

button {
    padding: 12px 30px;
    font-size: 1.1rem;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-approve {
    background-color: #ffab91;
    color: white;
    box-shadow: 0 2px 4px rgba(255, 171, 145, 0.3);
}

.btn-approve:hover {
    background-color: #ff8a65;
}

.btn-reject {
    background-color: #fff;
    color: #ef4444;
    border: 2px solid #fecaca;
}

.btn-reject:hover {
    background-color: #fef2f2;
    border-color: #f87171;
}

.btn-cancel {
    background-color: #fff;
    color: #ffab91;
    border: 2px solid #f4e2de;
}

.btn-cancel:hover {
    background-color: #fef9f6;
    color: #ff8a65;
    border-color: #ff8a65;
}

.reject-form {
    margin-top: 30px;
    text-align: left;
    background-color: #fff;
    padding: 20px;
    border-radius: 12px;
    border: 2px solid #fecaca;
}

.reject-form h3 {
    color: #b91c1c;
    margin-top: 0;
    font-size: 1.1rem;
    font-weight: 700;
}

textarea {
    width: 100%;
    padding: 12px;
    border: 2px solid #fecaca;
    border-radius: 8px;
    resize: none;
    font-size: 1rem;
    margin-bottom: 15px;
    box-sizing: border-box;
    background-color: #fef2f2;
}

textarea:focus {
    outline: none;
    border-color: #ef4444;
    background-color: #fff;
}

.form-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.btn-submit-reject {
    background-color: #ef4444;
    color: white;
}
.btn-submit-reject:hover {
    background-color: #dc2626;
}

.info-area {
    text-align: center;
    margin-top: 50px;
    color: #475569;
}

.info-area i {
    font-size: 3rem;
    margin-bottom: 15px;
}

.text-green {
    color: #22c55e;
}
.text-red {
    color: #ef4444;
}

.history-section {
    margin-top: 40px;
    background-color: #fff;
    border: 2px solid #f4e2de;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.history-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #ffab91;
    margin-top: 0;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 2px solid #f4e2de;
    padding-bottom: 10px;
}

.timeline {
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: relative;
    padding-left: 15px;
}

.timeline::before {
    content: '';
    position: absolute;
    left: 19px;
    top: 5px;
    bottom: 5px;
    width: 2px;
    background-color: #f4e2de;
}
.timeline-item {
    position: relative;
    padding-left: 25px;
}

.timeline-marker {
    position: absolute;
    left: 0;
    top: 5px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #ffab91;
    border: 2px solid #fff;
    box-shadow: 0 0 0 1px #ffab91;
    z-index: 1;
}

.timeline-date {
    font-size: 0.85rem;
    font-weight: 600;
    color: #ffab91;
    display: block;
    margin-bottom: 4px;
}

.stage-tag {
    display: inline-block;
    font-size: 0.8rem;
    background-color: #fef9f6;
    color: #ff8a65;
    border: 1px solid #ffab91;
    padding: 2px 8px;
    border-radius: 4px;
    margin-bottom: 8px;
    font-weight: 700;
}

.timeline-reason {
    font-size: 0.95rem;
    color: #334155;
    margin: 0;
    line-height: 1.5;
    font-weight: 600;
    background-color: #fff;
    padding: 10px;
    border-radius: 6px;
    border-left: 3px dashed #f4e2de;
}
</style>
