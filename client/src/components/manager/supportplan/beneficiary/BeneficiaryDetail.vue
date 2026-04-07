<script setup>
import axios from 'axios';
import { ref, watch } from 'vue';

const emit = defineEmits(['refresh']);
const props = defineProps({
    beneId: [String, Number],
    priorityId: [String, Number],
    planId: [String, Number]
});

const planDetail = ref({});
const attachments = ref([]);
const selectedFiles = ref([]);
const rejectionLog = ref([]); // 반려 히스토리 저장용
const isSubmitting = ref(false);

// 1. 상세 정보 및 반려 히스토리 가져오기
const fetchPlanDetail = async (id) => {
    if (!id) return;
    try {
        const response = await axios.get(`api/support/support-plans/${id}`);
        planDetail.value = response.data.plan || {};
        attachments.value = response.data.files || [];

        // 상태가 '반려'이거나 이력이 있을 수 있으므로 히스토리 조회
        fetchRejectionHistory(id);
    } catch (error) {
        console.error(`에러`, error);
    }
};

const uploadSelectedFiles = async (planId) => {
    if (!planId) return false;
    if (selectedFiles.value.length === 0) return true;

    const formData = new FormData();
    selectedFiles.value.forEach((file) => {
        formData.append('files', file);
    });

    const response = await axios.post(`api/support/support-plans/${planId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (response.data?.status !== 'success') return false;
    selectedFiles.value = [];
    await fetchPlanDetail(planId);
    return true;
};

const deleteExistingFile = async (fileId) => {
    const planId = planDetail.value?.plan_id;
    if (!planId || !fileId) return;
    if (!confirm('이 파일을 삭제하시겠습니까?')) return;
    try {
        const response = await axios.delete(`api/support/support-plans/${planId}/files/${fileId}`);
        if (response.data?.status === 'success') {
            await fetchPlanDetail(planId);
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

// 2. 삭제 (임시/대기 상태일 때만)
const DeleteTemp = async (planId) => {
    if (!confirm('삭제하시겠습니까?')) return;
    try {
        const response = await axios.delete(`api/support/support-plans/${planId}`);
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
const Approval = async (planId) => {
    if (isSubmitting.value) return;
    if (!confirm('수정한 내용으로 승인을 신청하시겠습니까?')) return;
    try {
        if (!planDetail.value?.plan_objective || !planDetail.value?.plan_content) {
            alert('내용을 입력해주세요');
            return;
        }

        isSubmitting.value = true;
        const uploaded = await uploadSelectedFiles(planId);
        if (!uploaded) {
            alert('파일 업로드에 실패했습니다.');
            return;
        }

        const updateData = {
            plan_objective: planDetail.value.plan_objective,
            plan_content: planDetail.value.plan_content
        };
        const response = await axios.put(`api/support/support-plans/${planId}`, updateData);
        if (response.data.status == true) {
            alert('승인 신청되었습니다.');
            emit('refresh');
        }
    } catch (error) {
        console.error('오류 발생', error);
    } finally {
        isSubmitting.value = false;
    }
};

// 4. 임시 저장
const SaveTemp = async (planId) => {
    if (isSubmitting.value) return;
    if (!confirm('내용을 저장하시겠습니까?')) return;
    try {
        isSubmitting.value = true;
        const uploaded = await uploadSelectedFiles(planId);
        if (!uploaded) {
            alert('파일 업로드에 실패했습니다.');
            return;
        }
        const updateData = {
            plan_objective: planDetail.value.plan_objective,
            plan_content: planDetail.value.plan_content
        };
        const response = await axios.put(`api/support/support-plans/${planId}/save`, updateData);
        if (response.data.status == true) {
            alert('임시저장되었습니다');
            emit('refresh');
        }
    } catch (error) {
        console.error('오류 발생', error);
    } finally {
        isSubmitting.value = false;
    }
};
//파일다운로드
const downloadFile = (file) => {
    const isConfirmed = confirm(`'${file.origin_name}' 파일을 다운로드하시겠습니까?`);
    if (isConfirmed) {
        const url = `api/download/${file.file_name}?originName=${encodeURIComponent(file.origin_name)}`;

        console.log('다운로드 시작:', file.origin_name);
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

watch(
    () => props.planId,
    (newId) => {
        fetchPlanDetail(newId);
    },
    { immediate: true }
);
</script>
<template>
    <div class="BfnewPlan">
        <h2>지원계획서 조회</h2>
        <hr class="main-hr" />

        <div class="info-row-top">
            <div class="status-box">
                <span :class="['state-badge', planDetail.progress_state]">상태: {{ planDetail.progress_state }}</span>
            </div>
            <div class="date-box"><strong>작성일 :</strong> {{ planDetail.created_at }}</div>
        </div>

        <div class="table-container">
            <div class="form-row">
                <label for="objective">지원목표</label>
                <div class="input-wrapper">
                    <input id="objective" v-model="planDetail.plan_objective" :readonly="!['수정중', '반려'].includes(planDetail.progress_state)" type="text" class="content-input" />
                </div>
            </div>

            <div class="form-row">
                <label for="content">계획내용</label>
                <div class="input-wrapper">
                    <textarea id="content" v-model="planDetail.plan_content" rows="8" :readonly="!['수정중', '반려'].includes(planDetail.progress_state)" class="content-textarea"></textarea>
                </div>
            </div>

            <div class="form-row">
                <label>파일첨부</label>
                <div class="input-wrapper">
                    <div class="file_input_container">
                        <input type="file" ref="fileInput" multiple @change="handleFileChange" @click.stop accept=".pdf, .png, .jpg, .jpeg, .xlsx, .xls, .docx, .doc, .hwp" style="display: none" />
                        <button v-if="['수정중', '반려'].includes(planDetail.progress_state)" type="button" class="btn_file_select" @click="$refs.fileInput.click()">파일 선택하기</button>

                        <ul v-if="attachments.length > 0" class="file_list">
                            <li v-for="file in attachments" :key="file.file_id" class="file_item clickable" @click="downloadFile(file)">
                                <span class="file_icon">{{ getFileIcon(file.origin_name) }}</span>
                                <span class="file_name">{{ file.origin_name }}</span>
                                <button v-if="['수정중', '반려'].includes(planDetail.progress_state)" type="button" class="btn_remove" @click.stop="deleteExistingFile(file.file_id)">✕</button>
                            </li>
                        </ul>
                        <span v-else class="no-attachments">첨부된 파일이 없습니다.</span>

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
        </div>

        <div class="button-group">
            <button v-if="['수정중', '반려'].includes(planDetail.progress_state)" class="btn-approve" @click="Approval(planDetail.plan_id)">승인 신청</button>
            <button v-if="['수정중', '반려'].includes(planDetail.progress_state)" class="btn-temp" @click="SaveTemp(planDetail.plan_id)">임시 저장</button>
            <button v-if="['대기'].includes(planDetail.progress_state) && rejectionLog.length === 0" class="btn-delete" @click="DeleteTemp(planDetail.plan_id)">삭제</button>
        </div>

        <div v-if="rejectionLog.length > 0" class="history-section">
            <h3 class="history-title">반려 리스트</h3>
            <div v-for="log in rejectionLog" :key="log.history_id" class="history-card clickable" @click="toggleHistory(log)">
                <div class="history-header">
                    <span class="history-user">검토자: {{ log.manager_name }}</span>
                    <span class="history-date">{{ log.created_at }}</span>
                </div>
                <div class="history-body"><strong>반려 사유:</strong> {{ log.rejection_reason }}</div>

                <div v-if="log.isOpen" class="history-detail-fold">
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
</template>

<style scoped>
/* 1. 전체 컨테이너 및 기본 텍스트 */
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
    border: none;
    border-top: 2px solid #f4e2de;
    margin: 15px 0;
}

/* 2. 상단 정보 (상태 & 작성자/일자) - 겹침 방지 및 양 끝 정렬 */
.info-row-top {
    display: flex !important;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    width: 100%;
}

.author-row,
.date-box {
    font-size: 1.1rem;
    color: #475569;
    white-space: nowrap;
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

/* 3. 테이블형 폼 */
.table-container {
    border: 2px solid #f4e2de;
    border-bottom: none;
    background-color: #fff;
}

.form-row {
    display: flex;
    border-bottom: 2px solid #f4e2de;
    min-height: 50px;
}

.form-row label {
    width: 140px;
    background: #fef9f6;
    padding: 15px;
    font-weight: bold;
    color: #475569;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 2px solid #f4e2de;
    flex-shrink: 0;
    font-size: 1.1rem;
}

.input-wrapper {
    flex: 1;
    display: flex;
    align-items: stretch;
}

.content-input,
.content-textarea {
    width: 100%;
    border: none;
    padding: 15px;
    outline: none;
    font-size: 1.1rem;
    color: #1e293b;
    background: transparent;
}

.content-textarea {
    resize: none;
    line-height: 1.6;
}

/* 4. 하단 버튼 그룹 (알약 디자인) */
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

/* 5. 반려 히스토리 (관리자 스타일과 완벽 통일) */
.history-section {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #f4e2de;
}

.history-title {
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

.history-body {
    font-size: 1.1rem;
    color: #1e293b;
    line-height: 1.6;
}

/* 상세 접힘 영역 상세 디자인 */
.history-detail-fold {
    margin-top: 15px;
    padding: 15px;
    background: #ffffff; /* 카드 배경보다 밝게 하여 구분감 생성 */
    border: 2px solid #f4e2de;
    border-radius: 8px;
}

.detail-label {
    display: block;
    font-weight: bold;
    color: #64748b;
    font-size: 1.1rem;
    margin-top: 10px;
    margin-bottom: 5px;
}

.pre-wrap {
    white-space: pre-wrap;
    word-break: break-all;
    font-size: 1.1rem;
    color: #334155;
    line-height: 1.6;
}

/* 💡 추가되는 파일 다운로드 스타일 */
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
    border: 1px solid #ff8a65;
    border-radius: 12px;
    margin-bottom: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
    min-width: 200px;
    transition: all 0.2s;
}

.file_item:hover {
    border-color: #ff8a65;
    color: white;
    background-color: #ff8a65;
}

.file_icon {
    font-size: 1.1rem;
    margin-right: 10px;
    display: flex;
    align-items: center;
    line-height: 1;
}

.file_name {
    flex: 1;
    font-size: 1.1rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
    background-color: #1d4ed8;
}

.btn_remove {
    background: #f1f5f9;
    border: none;
    color: #64748b;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-size: 1.1rem;
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
    color: #94a3b8;
    font-size: 1.1rem;
    padding: 5px 0;
}

.clickable {
    cursor: pointer;
}
</style>
