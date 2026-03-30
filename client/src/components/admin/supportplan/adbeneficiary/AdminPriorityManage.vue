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
const beneName = computed(() => surveyStore.selected_bene_detail?.bene_name || '지원자');
const currentStatus = computed(() => surveyStore.priority_data.progress_status || 'none');

const rejectReasonInput = ref('');
const isRejecting = ref(false);

// ⭐️ [신규] 반려 히스토리 상태 관리
const rejectHistoryList = ref([]);

const requestedStage = computed(() => {
    const dbCode = surveyStore.priority_data.priority_status;
    if (!dbCode || dbCode === 'none') return '알 수 없음';
    return PRIORITY_MAP[String(dbCode).toLowerCase()] || dbCode;
});

// ⭐️ [신규] 관리자 반려 히스토리 가져오기
const fetchRejectHistory = async () => {
    if (!targetBeneId.value) return;
    try {
        const res = await axios.get(`http://localhost:3000/abc/admin/priority/reject-history/${targetBeneId.value}`);
        if (res.data.success) {
            rejectHistoryList.value = res.data.data;
        }
    } catch (error) {
        console.error('반려 이력 조회 실패:', error);
    }
};

// 지원자가 바뀔 때마다 반려 히스토리도 새로고침
watch(
    () => targetBeneId.value,
    () => {
        fetchRejectHistory();
    },
    { immediate: true }
);

// 날짜 포맷 함수
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const handleApprove = async () => {
    if (!confirm(`${beneName.value} 님의 대기단계를 승인하시겠습니까?`)) return;
    try {
        await axios.post('http://localhost:3000/abc/admin/priority/approve', { bene_id: targetBeneId.value });
        alert('승인이 완료되었습니다.');
        await surveyStore.fetchPriorityInfo(targetBeneId.value);
        emit('refresh');
    } catch (error) {
        console.error(error);
        alert('승인 처리 중 오류가 발생했습니다.');
    }
};

const handleReject = async () => {
    if (!rejectReasonInput.value.trim()) return alert('반려 사유를 입력해주세요.');
    if (!confirm('반려하시겠습니까?')) return;

    try {
        await axios.post('http://localhost:3000/abc/admin/priority/reject', {
            bene_id: targetBeneId.value,
            reason: rejectReasonInput.value
        });
        alert('반려 처리되었습니다.');
        await surveyStore.fetchPriorityInfo(targetBeneId.value);
        emit('refresh');
    } catch (error) {
        console.error(error);
        alert('반려 처리 중 오류가 발생했습니다.');
    }
};
</script>

<template>
    <div class="priority-manage-container" v-if="isAdmin">
        <h2 class="title">{{ beneName }} 님의 대기단계 관리</h2>

        <!-- 대기 중 (pending) 일 때 승인/반려 영역 -->
        <div v-if="currentStatus === 'pending'" class="action-area">
            <div class="summary-card">
                <div class="summary-row">
                    <span class="info-label">현재 상태</span>
                    <span class="status-badge pending">승인 대기 중</span>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-row">
                    <span class="info-label">신청 단계</span>
                    <span class="info-value" :class="requestedStage">{{ requestedStage }}</span>
                </div>
            </div>

            <div class="action-buttons" v-if="!isRejecting">
                <button class="btn-approve" @click="handleApprove">승인하기</button>
                <button class="btn-reject" @click="isRejecting = true">반려하기</button>
                <button class="btn-cancel" @click="emit('close')">닫기</button>
            </div>

            <div v-if="isRejecting" class="reject-form">
                <h3>반려 사유 작성</h3>
                <textarea v-model="rejectReasonInput" placeholder="반려 사유를 상세히 적어주세요." rows="4"></textarea>
                <div class="form-actions">
                    <button class="btn-submit-reject" @click="handleReject">반려 완료</button>
                    <button class="btn-cancel" @click="isRejecting = false">취소</button>
                </div>
            </div>

            <!-- ⭐️ [신규] 과거 반려 이력 타임라인 (반려 사유 작성할 때 참고용) -->
            <div class="history-section" v-if="rejectHistoryList.length > 0">
                <h4 class="history-title"><i class="pi pi-history"></i> 과거 반려 이력</h4>
                <div class="timeline">
                    <div v-for="item in rejectHistoryList" :key="item.priority_id" class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div class="timeline-content">
                            <span class="timeline-date">{{ formatDate(item.approval_date) }}</span>
                            <span class="stage-tag">{{ PRIORITY_MAP[item.priority_status] || item.priority_status }} 단계 신청</span>
                            <p class="timeline-reason">{{ item.rejection_reason }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 미신청 / 승인완료 / 반려됨 상태 안내 메시지 -->
        <div v-else-if="currentStatus === 'none'" class="info-area">
            <i class="pi pi-info-circle"></i>
            <p>아직 대기단계 승인 신청이 접수되지 않았습니다.</p>
            <button class="btn-cancel mt-3" @click="emit('close')">닫기</button>
        </div>
        <div v-else-if="currentStatus === 'approved'" class="info-area">
            <i class="pi pi-check-circle text-green"></i>
            <p>이미 <strong>승인 완료</strong>된 상태입니다.</p>
            <button class="btn-cancel mt-3" @click="emit('close')">닫기</button>
        </div>
        <div v-else-if="currentStatus === 'rejected'" class="info-area">
            <i class="pi pi-times-circle text-red"></i>
            <p>현재 <strong>반려</strong>된 상태입니다. 담당자의 재신청을 기다려주세요.</p>
            <button class="btn-cancel mt-3" @click="emit('close')">닫기</button>
        </div>
    </div>
</template>

<style scoped>
/* 기존 스타일 그대로 유지하고 아래 타임라인 스타일만 추가합니다 */
.priority-manage-container {
    padding: 40px;
    background-color: #ffffff;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto; /* 내용이 많아지면 스크롤 */
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
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 30px;
}
.summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.summary-divider {
    height: 1px;
    background-color: #e2e8f0;
    margin: 15px 0;
}
.info-label {
    font-size: 1rem;
    color: #64748b;
    font-weight: 600;
}
.info-value {
    font-size: 1.2rem;
    font-weight: 800;
    color: #1e293b;
}
.status-badge.pending {
    background-color: #fef08a;
    color: #854d0e;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 700;
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
    background-color: #3b82f6;
    color: white;
}
.btn-approve:hover {
    background-color: #2563eb;
}
.btn-reject {
    background-color: #ef4444;
    color: white;
}
.btn-reject:hover {
    background-color: #dc2626;
}
.btn-cancel {
    background-color: #f1f5f9;
    color: #475569;
    border: 1px solid #cbd5e1;
}
.btn-cancel:hover {
    background-color: #e2e8f0;
}

.reject-form {
    margin-top: 30px;
    text-align: left;
    background-color: #fef2f2;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #fecaca;
}
.reject-form h3 {
    color: #b91c1c;
    margin-top: 0;
    font-size: 1.1rem;
}
textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #fca5a5;
    border-radius: 6px;
    resize: none;
    font-size: 1rem;
    margin-bottom: 15px;
    box-sizing: border-box;
}
textarea:focus {
    outline: none;
    border-color: #ef4444;
    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
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

/* ⭐️ [신규] 타임라인 스타일 */
.history-section {
    margin-top: 40px;
    background-color: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}
.history-title {
    font-size: 1.1rem;
    color: #475569;
    margin-top: 0;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 10px;
}
.timeline {
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: relative;
    padding-left: 15px;
}
/* 타임라인 세로선 */
.timeline::before {
    content: '';
    position: absolute;
    left: 19px;
    top: 5px;
    bottom: 5px;
    width: 2px;
    background-color: #e2e8f0;
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
    background-color: #cbd5e1;
    border: 2px solid #fff;
    box-shadow: 0 0 0 1px #cbd5e1;
    z-index: 1;
}
.timeline-date {
    font-size: 0.85rem;
    color: #94a3b8;
    display: block;
    margin-bottom: 4px;
}
.stage-tag {
    display: inline-block;
    font-size: 0.8rem;
    background-color: #f1f5f9;
    color: #64748b;
    padding: 2px 8px;
    border-radius: 4px;
    margin-bottom: 8px;
    font-weight: 600;
}
.timeline-reason {
    font-size: 0.95rem;
    color: #334155;
    margin: 0;
    line-height: 1.5;
    background-color: #f8fafc;
    padding: 10px;
    border-radius: 6px;
    border-left: 3px solid #cbd5e1;
}
</style>
