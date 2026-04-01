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

    const formData = new FormData();

    formData.append('priority_id', authStore.priorityId);
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
        const response = await axios.post('api/api/support-plan', formData, {
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
    }
};

const SaveTemp = async () => {
    if (!planObjective.value || !planContent.value) {
        alert('내용을 입력해주세요');
        return;
    }
    const target = {
        manager_id: authStore.userId,
        bene_id: props.beneId,
        plan_objective: planObjective.value,
        plan_content: planContent.value,
        progress_state: '임시'
    };
    try {
        const response = await axios.post('api/api/temp-plan', target);
        if (response.data) {
            alert('지원서가 입력되었습니다');
            emit('refresh');
        }
    } catch (error) {
        console.error('데이터 전송 중 에러', error);
        alert('서버오류');
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
        <div>
            <label>작성일:</label>
            <span>{{ today }}</span>
        </div>
        <div class="form_BfnewPlan">
            <label for="objective">지원목표</label>
            <input id="objective" v-model="planObjective" placeholder="목표를 입력해주세요" type="text" />
        </div>
        <div class="form_BfnewPlan">
            <label for="content">계획내용</label>
            <textarea id="content" v-model="planContent" rows="5" placeholder="지원계획 내용을 입력해주세요"></textarea>
        </div>
        <div class="form_BfnewPlan">
            <label for="file">파일첨부</label>
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
        <div>
            <button @click="Approval">승인하기</button>
            <button @click="SaveTemp">임시저장</button>
        </div>
    </div>
</template>
<style scoped>
/* 1. 전체 컨테이너 */
.BfnewPlan {
    max-width: 900px;
    margin: 0 auto;
    padding: 30px;
    background-color: #ffffff;
}

/* 제목 및 날짜 영역 */
h2 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 8px;
    letter-spacing: -0.05em;
}

.BfnewPlan > div:nth-child(2) {
    text-align: right;
    margin-bottom: 20px;
    color: #64748b;
    font-size: 0.95rem;
    border-bottom: 2px solid #334155; /* 제목 아래 굵은 선 */
    padding-bottom: 10px;
}

.BfnewPlan > div:nth-child(2) label {
    font-weight: 600;
    margin-right: 5px;
}

/* 2. 폼 필드 레이아웃 (표 형식 구현) */
.form_BfnewPlan {
    display: flex;
    border-bottom: 1px solid #e2e8f0;
    border-left: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
}

/* 첫 번째 필드만 상단 테두리 추가 */
.form_BfnewPlan:first-of-type {
    border-top: 1px solid #e2e8f0;
}

/* 라벨 스타일 (이미지 8번의 회색 배경 th 느낌) */
.form_BfnewPlan label {
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
}

/* 입력창 공통 스타일 */
input[type='text'],
textarea {
    flex: 1;
    border: none;
    padding: 15px 20px;
    font-size: 1rem;
    color: #334155;
    outline: none;
    background-color: transparent;
}

input::placeholder,
textarea::placeholder {
    color: #cbd5e1;
}

/* 계획내용 (Textarea) 높이 확보 */
textarea {
    min-height: 300px;
    line-height: 1.6;
    resize: none;
}

/* 3. 하단 버튼 영역 (이미지 10번 알약 스타일) */
.BfnewPlan > div:last-child {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 30px;
}

/* [승인하기] 버튼 */
button:first-of-type {
    padding: 12px 40px;
    background-color: #ffffff;
    color: #1e293b;
    border: 1px solid #1e293b;
    border-radius: 30px; /* 완전 둥근 알약 모양 */
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
}

button:first-of-type:hover {
    background-color: #1e293b;
    color: #ffffff;
}

/* [취소] 버튼 */
button:last-of-type {
    padding: 12px 24px;
    background-color: #f1f5f9;
    color: #64748b;
    border: none;
    border-radius: 30px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
}

button:last-of-type:hover {
    background-color: #e2e8f0;
    color: #475569;
}

/* 파일 첨부 영역 컨테이너 */
/* 파일 첨부 영역 컨테이너 */
.file_input_container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 15px;
}

/* [파일 선택하기] 버튼 - 더 산뜻하고 명확한 스타일 */
.btn_file_select {
    width: fit-content;
    padding: 8px 16px;
    background-color: #fff;
    color: #2563eb; /* 신뢰감을 주는 블루 */
    border: 1px solid #2563eb;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn_file_select:hover {
    background-color: #eff6ff; /* 연한 블루 배경 */
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.1);
}

/* 파일 리스트 영역 */
.file_list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap; /* 파일이 많아지면 옆으로 나열되다 줄바꿈 */
    gap: 10px;
}

/* 개별 파일 아이템 - 카드형 디자인 */
.file_item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    min-width: 200px; /* 너무 좁아지지 않게 설정 */
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition:
        transform 0.1s,
        border-color 0.2s;
}

.file_item:hover {
    border-color: #94a3b8;
    transform: translateY(-1px);
}

/* 파일명 텍스트 */
.file_name {
    flex: 1;
    font-size: 0.9rem;
    color: #475569;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 삭제 버튼 (✕) - 직관적인 레드 호버 */
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

/* 파일 아이콘 스타일 */
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

/* 아이콘 스타일 */
.file_icon {
    font-size: 1.2rem;
    margin-right: 10px; /* 아이콘과 글자 사이 간격 */
    display: flex;
    align-items: center;
    line-height: 1;
}

/* 파일명 스타일 */
.file_name {
    flex: 1;
    font-size: 0.95rem;
    color: #334155;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis; /* 파일명이 길면 ... 처리 */
}
</style>
