<script setup>
import axios from 'axios';
import { ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';

const emit = defineEmits(['refresh']);
const props = defineProps({ beneId: [String, Number], priorityId: [String, Number], planId: [String, Number] });

const authStore = useAuthStore();

const planDetail = ref({});
const attachments = ref([]);
const reasoninsert = ref(false);
const rejectReason = ref('');
const rejectionLog = ref([]);

const fetchPlanDetail = async (id) => {
    if (!id) return;
    try {
        const response = await axios.get(`/api/adsupport/admin/support-plan/${id}`);
        planDetail.value = response.data.plan || {};
        attachments.value = response.data.files || [];
        rejectReason.value = '';
        reasoninsert.value = false;
        fetchRejectionHistory(id);
    } catch (error) {
        console.error(`에러`, error);
    }
};

const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) return '🖼️';
    const iconMap = {
        pdf: '📕',
        xlsx: '📗',
        xls: '📗',
        docx: '📘',
        doc: '📘',
        hwp: '📝'
    };
    return iconMap[ext] || '📄';
};

const downloadFile = (file) => {
    const url = `/api/download/${file.file_name}?originName=${encodeURIComponent(file.origin_name)}`;
    window.location.href = url;
};

const fetchRejectionHistory = async (id) => {
    try {
        const response = await axios.get(`/api/adsupport/admin/support-plan/${id}/rejection-history`);
        rejectionLog.value = response.data.map((log) => ({
            ...log,
            isOpen: false
        }));
    } catch (error) {
        console.error('이력 조회 실패', error);
    }
};

const toggleHistory = (log) => {
    log.isOpen = !log.isOpen;
};

const startReject = () => {
    reasoninsert.value = true;
    rejectReason.value = '';
};

const Approval = async (planId) => {
    if (!confirm('승인하시겠습니까?')) return;
    try {
        const response = await axios.put(`/api/adsupport/admin/support-plan/${planId}/approval`);
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
        const updateRes = await axios.put(`/api/adsupport/admin/support-plan/${planId}/return`);
        if (updateRes.data.status) {
            const historyData = {
                plan_id: planId,
                plan_objective: planDetail.value.plan_objective,
                plan_content: planDetail.value.plan_content,
                rejection_reason: rejectReason.value,
                manager_id: authStore.userId
            };
            await axios.post(`/api/adsupport/admin/support-plan/rejection-history`, historyData);

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

        <div class="info-row-top">
            <div class="status-box">
                <span :class="['state-badge', planDetail.progress_state]"> 상태: {{ planDetail.progress_state }} </span>
            </div>
            <div class="author-row"><strong>작성자 :</strong> {{ planDetail.manager_name }}</div>
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

            <div class="form-row">
                <label>파일첨부</label>
                <div class="content-box file-box">
                    <ul v-if="attachments.length > 0" class="file_list">
                        <li v-for="file in attachments" :key="file.file_id" class="file_item clickable" @click="downloadFile(file)">
                            <span class="file_icon">{{ getFileIcon(file.origin_name) }}</span>
                            <span class="file_name">{{ file.origin_name }}</span>
                        </li>
                    </ul>
                    <span v-else class="no-file">첨부된 파일이 없습니다.</span>
                </div>
            </div>
        </div>

        <div class="button-group">
            <button v-if="['반려/재승인', '대기'].includes(planDetail.progress_state)" class="btn-approve" @click="Approval(planDetail.plan_id)">승인</button>
            <button v-if="['반려/재승인', '대기'].includes(planDetail.progress_state) && !reasoninsert" class="btn-reject" @click="reasoninsert = true">반려하기</button>
        </div>

        <div v-if="reasoninsert" class="reason-input-area">
            <p class="reason-label">반려 사유 입력</p>
            <textarea v-model="rejectReason" placeholder="사유를 입력하세요..."></textarea>
            <button class="btn-submit-reject" @click="updatereturn(planDetail.plan_id)">반려 확정</button>
        </div>

        <div v-if="rejectionLog.length > 0" class="history-section">
            <h3>반려 리스트</h3>

            <div v-for="log in rejectionLog" :key="log.history_id" class="history-card clickable" @click="toggleHistory(log)">
                <div class="history-header">
                    <span class="history-user">검토자: {{ log.manager_name }}</span>
                    <span class="history-date">{{ log.created_at }}</span>
                </div>

                <div class="history-body"><strong>반려 사유:</strong> {{ log.rejection_reason }}</div>

                <div v-if="log.isOpen" class="history-detail-fold">
                    <div class="detail-content">
                        <div class="detail-item">
                            <span class="detail-label">[당시 지원목표]</span>
                            <p>{{ log.plan_objective }}</p>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">[당시 계획내용]</span>
                            <p class="pre-wrap">{{ log.plan_content }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 1. 전체 컨테이너 레이아웃 */
.BfnewPlan {
    max-width: 900px;
    margin: 0 auto;
    padding: 30px;
    background-color: #ffffff;
    color: #1e293b;
    font-family:
        'Pretendard',
        -apple-system,
        sans-serif;
}

/* 메인 제목 아래 구분선 */
.main-hr {
    border: none;
    border-top: 2px solid #334155;
    margin-bottom: 20px;
}

/* 2. 상단 정보 (상태 배지 왼쪽 & 작성자 오른쪽) - 겹침 방지 핵심 */
.info-row-top {
    display: flex !important;
    justify-content: space-between; /* 양 끝 정렬 */
    align-items: center;
    width: 100%;
    margin-bottom: 15px;
    min-height: 32px; /* 높이 확보로 겹침 방지 */
}

.status-box {
    display: flex;
    align-items: center;
}

.author-row {
    font-size: 0.95rem;
    color: #475569;
    font-weight: 500;
    white-space: nowrap; /* 텍스트 줄바꿈 방지 */
}

/* 상태별 배지 스타일 */
.state-badge {
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: bold;
    display: inline-block;
}
.state-badge.대기 {
    background: #fef3c7;
    color: #d97706;
}
.state-badge.반려,
.state-badge.반려\/재승인 {
    background: #fee2e2;
    color: #dc2626;
}
.state-badge.승인 {
    background: #dcfce7;
    color: #16a34a;
}
.state-badge.임시 {
    background: #f1f5f9;
    color: #475569;
}

/* 3. 테이블 컨테이너 (조회용 그리드) */
.table-container {
    border: 1px solid #e2e8f0;
    background-color: #ffffff;
    margin-bottom: 25px;
    border-radius: 2px;
}

.form-row {
    display: flex;
    border-bottom: 1px solid #e2e8f0;
}

.form-row:last-child {
    border-bottom: none;
}

/* 왼쪽 라벨(제목) 영역 */
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

/* 오른쪽 내용 영역 */
.content-box {
    flex: 1;
    padding: 15px 20px;
    color: #1e293b;
    font-size: 1rem;
    display: flex;
    align-items: center;
    word-break: break-all;
    min-height: 58px;
}

/* 계획내용 등 긴 텍스트 영역 */
.text-area {
    min-height: 180px;
    align-items: flex-start; /* 상단 정렬 */
    line-height: 1.7;
    white-space: pre-wrap;
}

/* 파일 첨부 영역 */
.file-box {
    color: #64748b;
    padding: 10px 20px !important;
}

.file_list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    width: 100%;
}

.file_item {
    display: flex;
    align-items: center;
    background-color: #f1f5f9;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 0.9rem;
    color: #334155;
    border: 1px solid #e2e8f0;
    transition: all 0.2s;
    max-width: 250px;
}

.file_item.clickable:hover {
    background-color: #e2e8f0;
    border-color: #cbd5e1;
    cursor: pointer;
}

.file_icon {
    margin-right: 8px;
    font-size: 1.1rem;
}

.file_name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.no-file {
    color: #94a3b8;
    font-style: italic;
}

/* 4. 버튼 그룹 (알약 모양 디자인) */
.button-group {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin: 30px 0;
}

.button-group button {
    padding: 12px 28px;
    border-radius: 30px; /* 담당자 페이지와 동일한 알약 모양 */
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
}

/* 승인 버튼 (어두운 색상) */
.btn-approve,
.btn-submit-reject {
    background-color: #ffffff !important; /* 배경 흰색 */
    color: #e11d48 !important; /* 글자 빨간색 */
    border: 1px solid #e11d48 !important; /* 빨간 테두리 */
    padding: 12px 28px;
    border-radius: 30px; /* 알약 모양 */
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    display: block; /* 줄바꿈 적용 */
    margin-left: auto; /* 오른쪽 정렬 */
}

/* 반려 버튼 (흰색 배경 + 빨간 테두리) */
.btn-reject {
    background-color: #ffffff;
    color: #e11d48;
    border: 1px solid #e11d48 !important;
}

button:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
}

/* 5. 반려 사유 입력창 섹션 */
.reason-input-area {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 25px;
    margin-top: 15px;
}

.reason-label {
    font-weight: 800;
    font-size: 1.05rem;
    margin-bottom: 12px;
    color: #1e293b;
}

.reason-input-area textarea {
    width: 100%;
    height: 120px;
    padding: 15px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    resize: none;
    margin-bottom: 15px;
    font-size: 0.95rem;
}

/* 6. 반려 히스토리 섹션 */
.history-section {
    margin-top: 50px;
    padding-top: 20px;
    border-top: 1px solid #e2e8f0;
}

.history-section h3 {
    font-size: 1.25rem;
    font-weight: 800;
    margin-bottom: 20px;
}

.history-card {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 15px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.history-card:hover {
    background-color: #f1f5f9;
}

.history-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    border-bottom: 1px dashed #cbd5e1;
    padding-bottom: 10px;
    font-size: 0.9rem;
}

.history-user {
    font-weight: 700;
    color: #334155;
}
.history-date {
    color: #94a3b8;
}

.history-body {
    font-size: 0.95rem;
    color: #1e293b;
    line-height: 1.6;
}

/* 상세 접힘 영역 */
.history-detail-fold {
    margin-top: 15px;
    padding: 15px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
}

.detail-label {
    display: block;
    font-weight: bold;
    color: #64748b;
    font-size: 0.85rem;
    margin-top: 12px;
    margin-bottom: 5px;
}

.pre-wrap {
    white-space: pre-wrap;
    word-break: break-all;
}
</style>
