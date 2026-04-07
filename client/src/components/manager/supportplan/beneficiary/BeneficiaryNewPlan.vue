<script setup>
import axios from 'axios';
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({ beneId: [String, Number], priorityId: [String, Number] });
const emit = defineEmits(['refresh', 'savetem']);
const authStore = useAuthStore();

const planObjective = ref(''); //목표저장
const planContent = ref(''); //내용저장
const today = new Date().toLocaleDateString(); //작성일

const selectedFiles = ref([]);
const isSubmitting = ref(false);

const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    // 선택된 파일들을 배열로 변환하여 저장
    selectedFiles.value = [...selectedFiles.value, ...newFiles];
    event.target.value = '';
};

const removeFile = (index) => {
    // 배열에서 해당 인덱스의 파일을 제거
    selectedFiles.value.splice(index, 1);
};

const Approval = async () => {
    if (!planObjective.value || !planContent.value) {
        alert('내용을 입력해주세요');
        return;
    }
    if (isSubmitting.value) return;

    const formData = new FormData();

    formData.append('priority_id', props.priorityId);
    formData.append('manager_id', authStore.userId);
    formData.append('bene_id', props.beneId);
    formData.append('plan_objective', planObjective.value);
    formData.append('plan_content', planContent.value);
    formData.append('progress_state', '대기');

    // 2. 여러 개의 파일 추가 (백엔드에서 upload.array('files')로 받기로 함)
    selectedFiles.value.forEach((file) => {
        formData.append('files', file);
    });

    try {
        isSubmitting.value = true;
        const response = await axios.post('/api/support/support-plan', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        if (response.data.status === 'success') {
            alert('지원서와 파일이 정상적으로 등록되었습니다.');
            emit('refresh');
        }
    } catch (error) {
        console.error('데이터 전송 중 에러', error);
        alert('서버 오류가 발생했습니다.');
    } finally {
        isSubmitting.value = false;
    }
};

const SaveTemp = async () => {
    if (isSubmitting.value) return;
    if (!planObjective.value) {
        alert('내용을 입력해주세요');
        return;
    }
    try {
        isSubmitting.value = true;

        const formData = new FormData();
        formData.append('manager_id', authStore.userId);
        formData.append('bene_id', props.beneId);
        formData.append('plan_objective', planObjective.value);
        formData.append('plan_content', planContent.value);
        formData.append('progress_state', '임시');

        selectedFiles.value.forEach((file) => {
            formData.append('files', file);
        });

        const response = await axios.post('/api/support/temp-plan', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        if (response.data?.status === 'success') {
            alert('임시저장되었습니다');
            emit('refresh');
        }
    } catch (error) {
        console.error('데이터 전송 중 에러', error);
        alert('서버오류');
    } finally {
        isSubmitting.value = false;
    }
};

const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();

    // 이미지 파일인 경우 그림 아이콘만 반환
    if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
        return '🖼️';
    }

    // 문서 파일별 아이콘 설정
    const iconMap = {
        pdf: '📕',
        xlsx: '📗',
        xls: '📗',
        docx: '📘',
        doc: '📘',
        hwp: '📝'
    };

    return iconMap[ext] || '📄'; // 그 외에는 일반 문서 아이콘 하나만
};
</script>
<template>
    <div class="BfnewPlan">
        <h2>지원계획서 입력하기</h2>
        <div class="info-row-top">
            <div class="date-box"><strong>작성일 :</strong> {{ today }}</div>
        </div>

        <div class="table-container">
            <div class="form-row">
                <label for="objective">지원목표</label>
                <div class="input-wrapper">
                    <input id="objective" v-model="planObjective" placeholder="목표를 입력해주세요" type="text" class="content-input" />
                </div>
            </div>
            <div class="form-row">
                <label for="content">계획내용</label>
                <div class="input-wrapper">
                    <textarea id="content" v-model="planContent" rows="5" placeholder="지원계획 내용을 입력해주세요" class="content-textarea"></textarea>
                </div>
            </div>
            <div class="form-row">
                <label>파일첨부</label>
                <div class="input-wrapper">
                    <div class="file_input_container">
                        <input type="file" ref="fileInput" multiple @change="handleFileChange" @click.stop accept=".pdf, .png, .jpg, .jpeg, .xlsx, .xls, .docx, .doc, .hwp" style="display: none" />
                        <button type="button" class="btn_file_select" @click="$refs.fileInput.click()">파일 선택하기</button>

                        <ul v-if="selectedFiles.length > 0" class="file_list">
                            <li v-for="(file, index) in selectedFiles" :key="index" class="file_item">
                                <span class="file_icon">{{ getFileIcon(file.name) }}</span>
                                <span class="file_name">{{ file.name }}</span>
                                <button type="button" class="btn_remove" @click="removeFile(index)">✕</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="button-group">
            <button class="btn-approve" @click="Approval">승인하기</button>
            <button class="btn-temp" @click="SaveTemp">임시저장</button>
        </div>
    </div>
</template>
<style scoped>
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
    letter-spacing: -0.05em;
}

.info-row-top {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 15px;
    border-bottom: 2px solid #334155;
    padding-bottom: 10px;
}

.date-box {
    color: #64748b;
    font-size: 1.1rem;
}

.table-container {
    border: 1px solid #f4e2de;
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
    font-size: 1.1rem;
}

.input-wrapper {
    flex: 1;
    display: flex;
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
    background-color: transparent;
}

.content-textarea {
    min-height: 300px;
    line-height: 1.6;
    resize: none;
}

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

button:first-of-type:hover {
    background-color: #ff8a65;
    transform: translateY(-1px); /* 조금 더 확실한 상승감 */
    /* 버튼 색상과 맞춘 부드러운 그림자 */
    box-shadow: 0 10px 15px -3px rgba(255, 171, 145, 0.4);
}

button:last-of-type:not(.active-temp):hover {
    background-color: #ffab91; /* 아주 연한 주황 배경 */
    color: #ffffff;
    border-color: #ff8a65;
    box-shadow: 0 4px 6px rgba(255, 171, 145, 0.1);
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
    min-width: 200px; /* 너무 좁아지지 않게 */
    transition: all 0.2s;
}

.file_item:hover {
    border-color: #2563eb;
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
    text-overflow: ellipsis; /* 파일명이 길면 ... 처리 */
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
</style>
