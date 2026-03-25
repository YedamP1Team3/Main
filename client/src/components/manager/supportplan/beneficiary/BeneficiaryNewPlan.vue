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

const Approval = async () => {
    if (!planObjective.value || !planContent.value) {
        alert('내용을 입력해주세요');
        return;
    }
    const target = {
        priority_id: props.priorityId,
        manager_id: authStore.userId,
        bene_id: props.beneId,
        plan_objective: planObjective.value,
        plan_content: planContent.value,
        progress_state: '대기'
    };
    try {
        const response = await axios.post('http://localhost:3000/api/insertSupportPlan', target);
        if (response.data) {
            alert('지원서가 입력되었습니다');
            emit('refresh');
        }
    } catch (error) {
        console.error('데이터 전송 중 에러', error);
        alert('서버오류');
    }
};

const SaveTemp = async () => {
    if (!planObjective.value || !planContent.value) {
        alert('내용을 입력해주세요');
        return;
    }
    const target = {
        priority_id: props.priorityId,
        manager_id: authStore.userId,
        bene_id: props.beneId,
        plan_objective: planObjective.value,
        plan_content: planContent.value,
        progress_state: '임시'
    };
    try {
        const response = await axios.post('http://localhost:3000/api/insertSupportPlan', target);
        if (response.data) {
            alert('지원서가 입력되었습니다');
            emit('refresh');
        }
    } catch (error) {
        console.error('데이터 전송 중 에러', error);
        alert('서버오류');
    }
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
            <input type="text" placeholder="임시" />
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
</style>
