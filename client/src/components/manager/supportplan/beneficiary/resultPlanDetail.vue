<script setup>
import axios from 'axios';
import { ref, watch, onMounted } from 'vue';

const emit = defineEmits(['refresh', 'select-sub-plan']);
const props = defineProps({
    beneId: [String, Number],
    priorityId: [String, Number],
    resultId: [String, Number]
});

const resultDetail = ref({});
const rejectionLog = ref([]);
const selectedPlans = ref([]);
const attachments = ref([]);
const selectedFiles = ref([]);

const supportList = ref([]);
const supportPlan = ref('');

const isSubmitting = ref(false); //중복방지

// 1. 상세 정보 및 반려 히스토리 가져오기
const fetchResultDetail = async (id) => {
    if (!id) return;
    try {
        const response = await axios.get(`api/resultPlan/support-result/${id}`);
        resultDetail.value = response.data;
        selectedPlans.value = response.data.selected_plans || [];
        attachments.value = response.data.files || [];
    } catch (error) {
        console.error(`에러`, error);
    }
};

const uploadSelectedFiles = async (resultId) => {
    if (!resultId) return false;
    if (selectedFiles.value.length === 0) return true;

    const formData = new FormData();
    selectedFiles.value.forEach((file) => {
        formData.append('files', file);
    });

    const response = await axios.post(`api/resultPlan/support-result/${resultId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (response.data?.status !== 'success') return false;
    selectedFiles.value = [];
    await fetchResultDetail(resultId);
    return true;
};

const deleteExistingFile = async (fileId) => {
    const resultId = resultDetail.value?.result_id;
    if (!resultId || !fileId) return;
    if (!confirm('이 파일을 삭제하시겠습니까?')) return;
    try {
        const response = await axios.delete(`api/resultPlan/support-result/${resultId}/files/${fileId}`);
        if (response.data?.status === 'success') {
            await fetchResultDetail(resultId);
        } else {
            alert('파일 삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('파일 삭제 중 오류 발생', error);
        alert('파일 삭제 중 오류가 발생했습니다.');
    }
};

const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    selectedFiles.value = [...selectedFiles.value, ...newFiles];
    event.target.value = '';
};

const removeSelectedFile = (index) => {
    selectedFiles.value.splice(index, 1);
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
        const response = await axios.get(`/api/adsupport/admin/support-result/${id}/rejection-history`);
        // 어드민과 동일하게 각 항목에 상태값 주입
        rejectionLog.value = response.data.map((item) => ({
            ...item,
            plans: [], // 상세 계획을 담을 배열
            isOpened: false // 초기에는 닫힘 상태
        }));
    } catch (error) {
        console.error('이력 조회 실패', error);
        rejectionLog.value = [];
    }
};

//특정 항목 클릭 시 상세 계획서 조회 함수
const fetchHistoryPlans = async (log) => {
    if (log.isOpened) {
        log.isOpened = false;
        return;
    }
    rejectionLog.value.forEach((item) => (item.isOpened = false));

    // 상세 계획 데이터가 아직 없을 때만 서버에서 호출
    if (!log.plans || log.plans.length === 0) {
        try {
            const response = await axios.get(`api/adsupport/admin/rejection-history/${log.history_id}/plans`);
            log.plans = response.data.plans || [];
        } catch (error) {
            console.error('상세 계획 조회 실패:', error);
        }
    }

    log.isOpened = true; // 내용 표시
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
        const response = await axios.delete(`api/resultPlan/support-result/${resultId}`);
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

// 3. 재승인요청
const Approval = async (id) => {
    if (isSubmitting.value) return;
    if (!confirm('수정한 내용으로 재승인을 신청하시겠습니까?')) return;
    if (!resultDetail.value.result_title || !resultDetail.value.result_content) {
        alert('내용을 입력해주세요');
        return;
    }
    if (selectedPlans.value.length === 0) {
        alert('연결된 지원계획서가 없습니다. 결과에 포함할 계획을 선택해주세요.');
        return;
    }
    try {
        isSubmitting.value = true;
        const uploaded = await uploadSelectedFiles(id);
        if (!uploaded) {
            alert('파일 업로드에 실패했습니다.');
            return;
        }
        const planIds = selectedPlans.value.map((plan) => plan.plan_id);
        const updateData = {
            result_title: resultDetail.value.result_title,
            result_content: resultDetail.value.result_content,
            planIds: planIds
        };
        const response = await axios.put(`api/resultPlan/support-result/${id}/apply`, updateData);
        if (response.data.status === 'success') {
            alert('재승인 신청되었습니다.');
            emit('refresh');
        } else {
            alert('처리 중 오류가 발생했습니다.');
        }
    } catch (error) {
        console.error('오류 발생', error);
    } finally {
        isSubmitting.value = false;
    }
};

// 4. 임시 저장
const SaveTemp = async (id) => {
    if (isSubmitting.value) return;
    if (!confirm('수정한 내용으로 임시저장하겠습니까?')) return;
    try {
        isSubmitting.value = true;
        const uploaded = await uploadSelectedFiles(id);
        if (!uploaded) {
            alert('파일 업로드에 실패했습니다.');
            return;
        }
        const planIds = selectedPlans.value.map((plan) => plan.plan_id);
        const updateData = {
            result_title: resultDetail.value.result_title,
            result_content: resultDetail.value.result_content,
            planIds: planIds
        };
        const response = await axios.put(`/api/resultPlan/support-result/${id}/save`, updateData);
        if (response.data.status === 'success') {
            alert('임시저장되었습니다');
            emit('refresh');
        } else {
            alert('처리 중 오류가 발생했습니다.');
        }
    } catch (error) {
        console.error('오류 발생', error);
    } finally {
        isSubmitting.value = false;
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
                    <input id="objective" v-model="resultDetail.result_title" :readonly="!['수정중', '반려'].includes(resultDetail.progress_state)" type="text" class="content-input" />
                </div>
            </div>

            <div class="form-row">
                <label for="content">계획내용</label>
                <div class="input-wrapper">
                    <textarea id="content" v-model="resultDetail.result_content" rows="8" :readonly="!['수정중', '반려'].includes(resultDetail.progress_state)" class="content-textarea"></textarea>
                </div>
            </div>

            <div class="form-row">
                <label>파일첨부</label>
                <div class="input-wrapper">
                    <div class="file_input_container">
                        <input type="file" ref="fileInput" multiple @change="handleFileChange" @click.stop accept=".pdf, .png, .jpg, .jpeg, .xlsx, .xls, .docx, .doc, .hwp" style="display: none" />
                        <button v-if="['수정중', '반려'].includes(resultDetail.progress_state)" type="button" class="btn_file_select" @click="$refs.fileInput.click()">파일 선택하기</button>

                        <ul v-if="attachments.length > 0" class="file_list">
                            <li v-for="file in attachments" :key="file.file_id" class="file_item clickable" @click="downloadFile(file)">
                                <span class="file_icon">{{ getFileIcon(file.origin_name) }}</span>
                                <span class="file_name">{{ file.origin_name }}</span>
                                <button v-if="['수정중', '반려'].includes(resultDetail.progress_state)" type="button" class="btn_remove" @click.stop="deleteExistingFile(file.file_id)">✕</button>
                            </li>
                        </ul>
                        <div v-else class="no-attachments">첨부된 파일이 없습니다.</div>

                        <ul v-if="selectedFiles.length > 0" class="file_list">
                            <li v-for="(file, index) in selectedFiles" :key="index" class="file_item">
                                <span class="file_icon">{{ getFileIcon(file.name) }}</span>
                                <span class="file_name">{{ file.name }}</span>
                                <button type="button" class="btn_remove" @click="removeSelectedFile(index)">✕</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div v-if="['수정중', '반려'].includes(resultDetail.progress_state)" class="form-row">
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
                        <button v-if="['수정중', '반려'].includes(resultDetail.progress_state)" type="button" class="btn-remove-tag" @click.stop="removePlan(plan.plan_id)">X</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="button-group">
            <button v-if="['수정중', '반려'].includes(resultDetail.progress_state)" class="btn-approve" @click="Approval(resultDetail.result_id)">재승인 신청</button>
            <button v-if="['수정중', '반려'].includes(resultDetail.progress_state)" class="btn-temp" @click="SaveTemp(resultDetail.result_id)">임시 저장</button>
            <button v-if="['대기'].includes(resultDetail.progress_state) && rejectionLog.length === 0" class="btn-delete" @click="deleteTemp(resultDetail.result_id)">삭제</button>
        </div>

        <div v-if="rejectionLog.length > 0" class="history-section">
            <h3 class="history-title">반려 사유 목록</h3>
            <div class="history-list">
                <div v-for="log in rejectionLog" :key="log.history_id" class="history-card" :class="{ 'is-active': log.isOpened }" @click="fetchHistoryPlans(log)">
                    <div class="history-header">
                        <span class="history-user">검토자: {{ log.manager_name }}</span>
                        <span class="history-date">{{ log.created_at }}</span>
                    </div>

                    <div v-if="!log.isOpened" class="history-summary"><strong>사유:</strong> {{ log.rejection_reason }}</div>

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
                                    <span v-for="plan in log.plans" :key="plan.plan_id" class="plan-badge">{{ plan.plan_objective }}</span>
                                    <div v-if="!log.plans || log.plans.length === 0" class="no-data">연결된 계획 정보가 없습니다.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 전체 컨테이너 */
.BfnewPlan {
    max-width: 100%;
    margin: 10px auto;
    padding: 50px;
    border: 2px solid #f4e2de;
    background-color: #ffffff;
    color: #334155;
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
    background: #f4e2de;
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
    border-radius: 4px;
    font-size: 1.1rem;
    font-weight: bold;
}
.state-badge.임시 {
    background: #f1f5f9;
    color: #475569;
}
.state-badge.반려,
.state-badge.재승인,
.state-badge.수정중 {
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

/* 표 레이아웃 */
.table-container {
    border-top: 1px solid #f4e2de;
}
.form-row {
    display: flex;
    border-bottom: 1px solid #f4e2de;
    border-left: 1px solid #f4e2de;
    border-right: 1px solid #f4e2de;
}
.form-row label {
    width: 140px;
    background-color: #fef9f6;
    color: #475569;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    border-right: 1px solid #f4e2de;
    font-size: 1.1rem;
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
    font-size: 1.1rem;
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
    border: 1px solid #f4e2de;
    background: #fef9f6;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}
.plan-tag-item {
    display: flex;
    align-items: center;
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 1.1rem;
    border: 1px solid #ffab91;
    cursor: pointer;
    margin-right: 5px;
}

.plan-tag-item:hover {
    background-color: #ff8a65; /* 아주 연한 살구색 배경 */
    border-color: #ff8a65; /* 테두리 한 톤 진하게 */
    color: #ffffff; /* 글자색도 함께 강조 */
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

/* 삭제 버튼 호버 시 효과 */
.btn-remove-tag:hover {
    background-color: #fee2e2; /* 연한 빨간색 배경 생성 */
    color: #ef4444; /* 글자색을 진한 빨간색으로 강조 */
    transform: scale(1.2); /* 버튼 크기를 살짝 키워 강조 */
}

/* 하단 버튼 (우측 정렬) */
.button-group {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
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
.btn-temp {
    background: #ffffff;
    border: 2px solid #ffab91 !important;
    color: #ffab91;
}
.btn-delete {
    background: #ffffff !important;
    color: #e11d48;
    border: 2px solid #e11d48 !important;
}
/* [+추가하기] 버튼 호버 */
button:first-of-type:hover {
    background-color: #ff8a65;
    transform: translateY(-1px); /* 조금 더 확실한 상승감 */
    /* 버튼 색상과 맞춘 부드러운 그림자 */
    box-shadow: 0 10px 15px -3px rgba(255, 171, 145, 0.4);
}

/* [임시저장] 버튼 호버 */
button:last-of-type:not(.active-temp):hover {
    background-color: #ffab91; /* 아주 연한 주황 배경 */
    color: #ffffff;
    border-color: #ff8a65;
    box-shadow: 0 4px 6px rgba(255, 171, 145, 0.1);
}
/* 삭제 호버 */
.btn-delete:hover {
    background-color: #ffffff !important; /* 아주 연한 레드 배경 */
    color: #be123c !important;
}

/* 반려 이력 */
/* 반려 히스토리 섹션 (관리자용 디자인 계승) */
/* 6. 반려 히스토리 섹션 */
.history-section {
    margin-top: 50px;
    padding-top: 20px;
    border-top: 1px solid #f4e2de;
}

.history-section h3 {
    font-size: 1.5rem;
    font-weight: 800;
    margin-bottom: 20px;
}

.history-card {
    background-color: #fef9f6;
    border: 1px solid #f4e2de;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 15px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.history-card:hover {
    background-color: #ff8a65;
}

.history-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    border-bottom: 1px dashed #cbd5e1;
    padding-bottom: 10px;
    font-size: 1.1rem;
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
    border: 1px solid #f4e2de;
    border-radius: 8px;
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

.btn_file_select {
    width: fit-content;
    padding: 10px 15px;
    border: 1px solid #ff8a65 !important;
    background-color: #ffffff;
    color: #ff8a65;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
}

.btn_file_select:hover {
    background-color: #eff6ff;
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.1);
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
    font-size: 0.95rem;
    color: #334155;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.btn_remove {
    background: #f1f5f9;
    border: none;
    color: #64748b;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-size: 0.8rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.btn_remove:hover {
    background-color: #fee2e2;
    color: #ef4444;
}

.no-attachments {
    padding: 5px 0;
    color: #94a3b8;
    font-size: 0.9rem;
}

.clickable {
    cursor: pointer;
}
</style>
