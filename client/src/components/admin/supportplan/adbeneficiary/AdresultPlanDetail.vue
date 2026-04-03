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
const attachments = ref([]);
const rejectionLog = ref([]); // 반려 히스토리 저장용
const selectedPlans = ref([]); //연결된 지원계획서 목록 저장용

const reasoninsert = ref(false);
const rejectReason = ref('');

// 1. 상세 정보 및 반려 히스토리 가져오기
const fetchResultDetail = async (id) => {
    if (!id) return;
    try {
        const response = await axios.get(`api/adsupport/admin/support-result/${id}`);
        resultDetail.value = response.data;
        selectedPlans.value = response.data.selected_plans || []; // ✅ 계획서 목록 추출
        attachments.value = response.data.files || [];
        fetchRejectionHistory(id);
    } catch (error) {
        console.error(`에러`, error);
    }
};
// 히스토리 조회;
// 1. 목록만 가져오기
const fetchRejectionHistory = async (id) => {
    try {
        const response = await axios.get(`api/adsupport/admin/support-result/${id}/rejection-history`);
        rejectionLog.value = response.data.map((item) => ({
            ...item,
            plans: [],
            isOpened: false, // 열림 상태 초기값
            loading: false
        }));
    } catch (error) {
        console.error('이력 조회 실패', error);
    }
};

// 특정 항목을 클릭했을 때 호출할 함수 (토글 기능 추가)
const fetchHistoryPlans = async (log) => {
    if (log.isOpened) {
        log.isOpened = false;
        return;
    }
    rejectionLog.value.forEach((item) => (item.isOpened = false));
    try {
        const response = await axios.get(`api/adsupport/admin/rejection-history/${log.history_id}/plans`);

        // 2. ⭐️ 데이터 할당 (서버 응답 구조에 맞춤)
        // 만약 서버가 { plans: [] } 로 보낸다면 response.data.plans를 사용
        log.plans = response.data.plans || [];
        log.isOpened = true;
    } catch (error) {
        console.error('상세 계획 조회 실패:', error);
    }
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

const downloadFile = (file) => {
    const isConfirmed = confirm(`'${file.origin_name}' 파일을 다운로드하시겠습니까?`);
    if (isConfirmed) {
        const url = `api/download/${file.file_name}?originName=${encodeURIComponent(file.origin_name)}`;
        window.location.href = url;
    }
};

const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();

    if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
        return '🖼️';
    }

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

// 4. 반려사항
const updateReturn = async (resultId) => {
    if (!rejectReason.value.trim()) {
        alert('반려 사유를 입력해주세요.');
        return;
    }
    if (!confirm('반려하시겠습니까?')) return;
    try {
        const updateRes = await axios.put(`api/adsupport/admin/support-result/${resultId}/return`);
        if (updateRes.data.status) {
            const planIds = selectedPlans.value.map((p) => p.plan_id);
            const historyData = {
                result_id: resultId,
                result_title: resultDetail.value.result_title,
                result_content: resultDetail.value.result_content,
                rejection_reason: rejectReason.value,
                manager_id: authStore.userId,
                plan_ids: planIds
            };
            await axios.post(`api/adsupport/admin/support-result/rejection-history`, historyData);

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
            <div class="date-box"><strong>작성자 :</strong> {{ resultDetail.manager_name }}</div>
        </div>

        <div class="table-container">
            <div class="form-row">
                <label for="objective">지원목표</label>
                <div class="input-wrapper">
                    <input id="objective" v-model="resultDetail.result_title" readonly type="text" class="content-input" />
                </div>
            </div>

            <div class="form-row">
                <label for="content">계획내용</label>
                <div class="input-wrapper">
                    <textarea id="content" v-model="resultDetail.result_content" rows="8" readonly class="content-textarea"></textarea>
                </div>
            </div>

            <div class="form-row">
                <label>파일첨부</label>
                <div class="input-wrapper">
                    <div class="file_input_container">
                        <ul v-if="attachments.length > 0" class="file_list">
                            <li v-for="file in attachments" :key="file.file_id" class="file_item clickable" @click="downloadFile(file)">
                                <span class="file_icon">{{ getFileIcon(file.origin_name) }}</span>
                                <span class="file_name">{{ file.origin_name }}</span>
                            </li>
                        </ul>
                        <span v-else class="no-attachments">첨부된 파일이 없습니다.</span>
                    </div>
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
            <button v-if="['반려/재승인', '대기'].includes(resultDetail.progress_state) && !reasoninsert" class="btn-reject" @click="reasoninsert = true">반려하기</button>
        </div>

        <div v-if="reasoninsert" class="reason-input-area">
            <p class="reason-label">반려 사유 입력</p>
            <textarea v-model="rejectReason" placeholder="사유를 입력하세요..."></textarea>
            <button class="btn-submit-reject" @click="updateReturn(resultDetail.result_id)">반려 확정</button>
        </div>

        <div v-if="rejectionLog.length > 0" class="history-section">
            <h3>반려 리스트</h3>

            <div v-for="log in rejectionLog" :key="log.history_id" class="history-card" :class="{ 'is-active': log.isOpened }" @click="fetchHistoryPlans(log)">
                <div class="history-header">
                    <span class="history-user">검토자: {{ log.manager_name }}</span>
                    <span class="history-date">{{ log.created_at }}</span>
                </div>

                <div v-if="!log.isOpened" class="history-summary">사유: {{ log.rejection_reason }}</div>

                <div v-if="log.isOpened" class="history-detail">
                    <div class="detail-inner-box">
                        <div class="detail-row">
                            <span class="detail-label">지원 목표</span>
                            <div class="detail-value">{{ log.result_title || '내용 없음' }}</div>
                        </div>

                        <div class="detail-row">
                            <span class="detail-label">지원 내용</span>
                            <div class="detail-value">{{ log.result_content || '내용 없음' }}</div>
                        </div>

                        <div class="detail-row">
                            <span class="detail-label">연결된 계획</span>
                            <div class="plan-tags">
                                <span v-for="plan in log.plans" :key="plan.plan_id" class="plan-badge">{{ plan.plan_objective }} </span>
                                <div v-if="!log.plans || log.plans.length === 0" class="no-data">연결된 계획 정보가 없습니다.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 1. 전체 컨테이너 레이아웃 (AdplanDetail과 동일) */
.BfnewPlan {
    max-width: 100%;
    margin: 10px auto;
    padding: 50px;
    background-color: #ffffff;
    border: 2px solid #f4e2de;
    color: #1e293b;
    font-family:
        'Pretendard',
        -apple-system,
        sans-serif;
}

h2 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 8px;
}

h3 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 8px;
}
/* 메인 제목 아래 구분선 */
.main-hr {
    border: none;
    border-top: 2px solid #f4e2de;
    margin-bottom: 20px;
}

/* 2. 상단 정보 (상태 배지 & 작성일) */
.info-row-top {
    display: flex !important;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 15px;
    min-height: 32px;
}

.status-box {
    display: flex;
    align-items: center;
}

.date-box {
    font-size: 1.1rem;
    color: #475569;
    font-weight: 500;
}

/* 상태별 배지 스타일 */
.state-badge {
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 1.1rem;
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

/* 3. 테이블 컨테이너 (조회/수정용 그리드) */
.table-container {
    border: 1px solid #f4e2de;
    background-color: #ffffff;
    margin-bottom: 25px;
    border-radius: 2px;
}

.form-row {
    display: flex;
    border-bottom: 1px solid #f4e2de;
}

.form-row:last-child {
    border-bottom: none;
}

.form-row label {
    width: 140px;
    min-width: 140px;
    background-color: #fef9f6;
    color: #475569;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    border-right: 1px solid #f4e2de;
}

/* 입력 영역 스타일 */
.input-wrapper {
    flex: 1;
    padding: 10px 15px;
    display: flex;
    align-items: center;
}

.content-input,
.content-textarea {
    width: 100%;
    border: 1px solid transparent;
    padding: 8px 12px;
    font-size: 1.1rem;
    color: #1e293b;
    outline: none;
    background: transparent;
}

/* 읽기 전용이 아닐 때의 테두리 스타일 */
.content-input:not([readonly]),
.content-textarea:not([readonly]) {
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    background: #fff;
}

.content-textarea {
    line-height: 1.7;
    resize: none;
}

.gray-bg {
    background-color: #f1f5f9 !important;
    color: #94a3b8;
}

/* 선택된 계획 태그 스타일 */
.plan-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.plan-tag-item {
    background-color: #ffffff;
    border: 1px solid #ffab91;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.2s;
}

.plan-tag-item:hover {
    background-color: #ff8a65;
}

/* 4. 버튼 그룹 */
.button-group {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin: 25px 0;
}

.button-group button {
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    transition: 0.2s;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-approve {
    background: #ffab91;
    color: #fff;
}
.btn-submit-reject {
    background-color: #ffab91 !important; /* 배경 흰색 */
    color: white !important; /* 글자 빨간색 */
    padding: 10px 24px;
    border-radius: 8px; /* 알약 모양 */
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: block; /* 줄바꿈 적용 */
    margin-left: auto; /* 오른쪽 정렬 */
}
/* 반려 버튼 (흰색 배경 + 빨간 테두리) */
.btn-reject {
    background-color: #ffffff;
    color: #ffab91;
    border: 2px solid #ffab91 !important;
}

button:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
}

/* 5. 반려 사유 입력창 */
.reason-input-area {
    background-color: #fef9f6;
    border: 2px solid #f4e2de;
    border-radius: 12px;
    padding: 25px;
    margin-top: 15px;
}

.reason-label {
    font-weight: 800;
    font-size: 1.1rem;
    margin-bottom: 12px;
    color: #1e293b;
}

.reason-input-area textarea {
    width: 100%;
    height: 120px;
    padding: 15px;
    background-color: #ffffff;
    border: 1px solid #f4e2de;
    border-radius: 8px;
    resize: none;
    margin-bottom: 15px;
    font-size: 1.1rem;
}

/* 6. 반려 히스토리 섹션 */
.history-section {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #f4e2de;
}

.history-section h3 {
    font-size: 1.5rem;
    margin-bottom: 15px;
    font-weight: 800;
    color: #1e293b;
}

.history-card {
    border: 2px solid #f4e2de;
    border-radius: 10px;
    padding: 18px;
    margin-bottom: 15px;
    background: #fef9f6; /* 관리자 카드 배경색 적용 */
    cursor: pointer;
    transition: 0.2s ease;
}

.history-card:hover {
    background-color: #ffab91;
    border-color: #ffab91;
}

.history-header {
    display: flex;
    justify-content: space-between;
    font-size: 1.1rem;
    color: #64748b;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 2px dashed #f4e2de; /* 관리자용 점선 스타일 */
}

.history-user {
    font-weight: 700;
    color: #334155;
}
.history-date {
    color: #94a3b8;
}

.history-summary {
    font-size: 1.1rem;
    color: #1e293b;
}

/* 상세 내역 스타일 */
.history-detail {
    margin-top: 15px;
    padding: 15px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
}

.detail-row {
    margin-bottom: 12px;
}

.detail-label {
    display: block;
    font-weight: bold;
    color: #64748b;
    font-size: 1.1rem;
    margin-bottom: 5px;
}

.detail-value {
    font-size: 1.1rem;
    line-height: 1.6;
    white-space: pre-wrap;
}

.plan-badge {
    display: inline-block;
    background: #ffffff;
    border: 1px solid #ffab91;
    padding: 2px 8px;
    border-radius: 8px;
    font-size: 1.1rem;
    margin-right: 5px;
    margin-top: 5px;
}

.file_input_container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 15px;
}

.file_list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.file_item {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    margin-bottom: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
    min-width: 200px;
    transition: all 0.2s;
}

.file_item:hover {
    border-color: #2563eb;
    background-color: #f8fafc;
}

.file_icon {
    font-size: 1.2rem;
    margin-right: 10px;
    display: flex;
    align-items: center;
    line-height: 1;
}

.file_name {
    flex: 1;
    font-size: 1.1.rem;
    color: #334155;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.no-attachments {
    color: #94a3b8;
    font-size: 1.1rem;
    padding: 5px 0;
}

.clickable {
    cursor: pointer;
}
</style>
