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
const attachments = ref([]);
const selectedFiles = ref([]);
const isSubmitting = ref(false);

// 1. 상세 정보
const fetchTempDetail = async (id) => {
    if (!id) return;
    try {
        const response = await axios.get(`/api/support/temp-plans/${id}`);
        tempDetail.value = response.data || {};
        attachments.value = response.data?.files || [];
    } catch (error) {
        console.error(`에러`, error);
    }
};

// 2. 삭제 (임시/대기 상태일 때만)
const DeleteTemp = async (planDraftId) => {
    if (!confirm('삭제하시겠습니까?')) return;
    try {
        const response = await axios.delete(`/api/support/temp-plans/${planDraftId}`);
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

const uploadSelectedFiles = async (planDraftId) => {
    if (!planDraftId) return false;
    if (selectedFiles.value.length === 0) return true;

    const formData = new FormData();
    selectedFiles.value.forEach((file) => {
        formData.append('files', file);
    });

    const response = await axios.post(`/api/support/temp-plans/${planDraftId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (response.data?.status !== 'success') return false;
    selectedFiles.value = [];
    return true;
};

const deleteExistingFile = async (fileId) => {
    const planDraftId = tempDetail.value?.plan_draft_id;
    if (!planDraftId || !fileId) return;
    if (!confirm('이 파일을 삭제하시겠습니까?')) return;
    try {
        const response = await axios.delete(`/api/support/temp-plans/${planDraftId}/files/${fileId}`);
        if (response.data?.status === 'success') {
            await fetchTempDetail(planDraftId);
        } else {
            alert('파일 삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('파일 삭제 중 오류 발생', error);
        alert('파일 삭제 중 오류가 발생했습니다.');
    }
};

// 3. 승인 신청 (수정 후 재신청)
const Approval = async (planDraftId) => {
    if (!tempDetail.value.plan_objective || !tempDetail.value.plan_content) {
        alert('내용을 입력해주세요');
        return;
    }
    if (isSubmitting.value) return;
    if (!planDraftId) return;
    try {
        isSubmitting.value = true;
        const uploaded = await uploadSelectedFiles(planDraftId);
        if (!uploaded) {
            alert('파일 업로드에 실패했습니다.');
            return;
        }
    } catch (error) {
        console.error('파일 업로드 중 오류 발생', error);
        alert('파일 업로드 중 오류가 발생했습니다.');
        return;
    }
    const target = {
        priority_id: props.priorityId,
        manager_id: authStore.userId,
        bene_id: props.beneId,
        plan_objective: tempDetail.value.plan_objective,
        plan_content: tempDetail.value.plan_content,
        progress_state: '대기',
        plan_draft_id: planDraftId
    };

    try {
        const response = await axios.post(`/api/support/temp-plans/approve`, target);
        if (response.data.status === 'success') {
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
const SaveTemp = async (planDraftId) => {
    if (!confirm('내용을 저장하시겠습니까?')) return;
    if (isSubmitting.value) return;
    try {
        isSubmitting.value = true;
        const uploaded = await uploadSelectedFiles(planDraftId);
        if (!uploaded) {
            alert('파일 업로드에 실패했습니다.');
            return;
        }
        const updateData = {
            plan_objective: tempDetail.value.plan_objective,
            plan_content: tempDetail.value.plan_content
        };
        const response = await axios.put(`/api/support/temp-plans/${planDraftId}`, updateData);
        if (response.data.status == true) {
            await fetchTempDetail(planDraftId);
            alert('임시저장되었습니다');
            emit('refresh');
        }
    } catch (error) {
        console.error('오류 발생', error);
    } finally {
        isSubmitting.value = false;
    }
};

const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    selectedFiles.value = [...selectedFiles.value, ...newFiles];
    event.target.value = '';
};

const removeFile = (index) => {
    selectedFiles.value.splice(index, 1);
};

const downloadFile = (file) => {
    const isConfirmed = confirm(`'${file.origin_name}' 파일을 다운로드하시겠습니까?`);
    if (isConfirmed) {
        const url = `api/download/${file.file_name}?originName=${encodeURIComponent(file.origin_name)}`;

        console.log('다운로드 시작:', file.origin_name);
        window.location.href = url;
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
            <div class="state-badge">
                <span>상태: {{ tempDetail.progress_state }}</span>
            </div>
            <div class="date-box"><strong>작성일 :</strong> {{ tempDetail.created_at }}</div>
        </div>

        <div class="table-container">
            <div class="form-row">
                <label for="objective">지원목표</label>
                <div class="input-wrapper">
                    <input id="objective" v-model="tempDetail.plan_objective" type="text" class="content-input" />
                </div>
            </div>
            <div class="form-row">
                <label for="content">계획내용</label>
                <div class="input-wrapper">
                    <textarea id="content" v-model="tempDetail.plan_content" rows="8" class="content-textarea"></textarea>
                </div>
            </div>
            <div class="form-row">
                <label>파일첨부</label>
                <div class="input-wrapper">
                    <div class="file_input_container">
                        <input type="file" ref="fileInput" multiple @change="handleFileChange" @click.stop accept=".pdf, .png, .jpg, .jpeg, .xlsx, .xls, .docx, .doc, .hwp" style="display: none" />
                        <button type="button" class="btn_file_select" @click="$refs.fileInput.click()">파일 선택하기</button>

                        <ul v-if="attachments.length > 0 || selectedFiles.length > 0" class="file_list">
                            <li v-for="file in attachments" :key="file.file_id" class="file_item clickable" @click="downloadFile(file)">
                                <span class="file_icon">{{ getFileIcon(file.origin_name) }}</span>
                                <span class="file_name">{{ file.origin_name }}</span>
                                <button type="button" class="btn_remove" @click.stop="deleteExistingFile(file.file_id)">✕</button>
                            </li>

                            <li v-for="(file, index) in selectedFiles" :key="index" class="file_item">
                                <span class="file_icon">{{ getFileIcon(file.name) }}</span>
                                <span class="file_name">{{ file.name }}</span>
                                <button type="button" class="btn_remove" @click="removeFile(index)">✕</button>
                            </li>
                        </ul>

                        <div v-else class="no-attachments">첨부된 파일이 없습니다.</div>
                    </div>
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
    max-width: 100%;
    margin: 10px auto;
    padding: 50px;
    border: 2px solid #f4e2de;
    background-color: #ffffff;
    color: #334155;
}

.main-hr {
    border: none;
    border-top: 2px solid #f4e2de;
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
    font-size: 1.1rem;
    color: #475569;
}

/* 상태 배지 */
.state-badge {
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 1.1rem;
    font-weight: bold;
}
.state-badge.임시 {
    background: #f1f5f9;
    color: #006aff;
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
    border: 1px solid #f4e2de;
}

.form-row {
    display: flex;
    border: 1px solid #f4e2de;
}

.form-row:last-child {
    border-bottom: 1px solid #f4e2de;
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

.input-wrapper {
    flex: 1;
    display: flex;
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
    padding: 8px 16px;
    background-color: #fff;
    color: #ffab91;
    border: 1px solid #ffab91;
    border-radius: 6px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn_file_select:hover {
    background-color: #ff8a65;
    color: white;
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.1);
}

.file_list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}

.file_item {
    display: flex;
    align-items: center;
    padding: 3px 16px;
    background-color: #ffffff;
    border: 1px solid #f4e2de;
    border-radius: 12px;
    margin-bottom: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
    min-width: 200px;
    transition: all 0.2s;
}

.file_item:hover {
    border-color: #ff8a65;
    background-color: #f8fafc;
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
    color: #334155;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.btn_remove {
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
    padding: 5px 0;
    color: #94a3b8;
    font-size: 1.1rem;
}

.clickable {
    cursor: pointer;
}

.content-input,
.content-textarea {
    width: 100%;
    border: none;
    padding: 15px;
    outline: none;
    font-size: 1.1rem;
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
    gap: 10px;
    margin: 25px 0;
}

.button-group button {
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    border: 2px solid transparent; /* 테두리 두께 통일 */
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 1. 승인 신청 (Primary) */
.btn-approve {
    background-color: #ffab91;
    color: #fff;
    border-color: #ffab91;
}

.btn-approve:hover {
    background-color: #ff8a65;
    border-color: #ff8a65;
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(255, 171, 145, 0.4);
}

/* 2. 임시 저장 (Secondary) */
.btn-temp {
    background-color: #ffffff;
    border-color: #ffab91 !important;
    color: #ffab91;
}

.btn-temp:hover {
    background-color: #ffab91;
    color: #ffffff;
    border-color: #ff8a65;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(255, 171, 145, 0.1);
}

/* 3. 삭제 (Danger) */
.btn-delete {
    background-color: #ffffff;
    color: #e11d48;
    border-color: #e11d48 !important;
}

.btn-delete:hover {
    background-color: #fff1f2 !important; /* 아주 연한 레드 배경 */
    color: #be123c;
    border-color: #be123c;
    transform: translateY(-1px);
}

/* 반려 히스토리 섹션 (관리자용 디자인 계승) */

.download-list {
    list-style: none;
    padding: 12px 15px;
    margin: 0;
    width: 100%;
}

.download-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    margin-bottom: 5px;
    background-color: #f1f5f9;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
}

.download-item:hover {
    background-color: #e2e8f0;
    text-decoration: underline;
    color: #2563eb;
}

.download-item i {
    margin-right: 10px;
    color: #64748b;
}

.file-name-text {
    font-size: 1.1rem;
    font-weight: 500;
    flex: 1;
}

.file-size {
    font-size: 1.1rem;
    color: #94a3b8;
    margin-left: 10px;
}
</style>
