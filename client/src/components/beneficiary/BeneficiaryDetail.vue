<script setup>
import axios from 'axios';
import { ref, watch } from 'vue';
const emit = defineEmits(['refresh']);

const props = defineProps({ beneId: [String, Number], priorityId: [String, Number], planId: [String, Number] });

const planDetail = ref({});

const fetchPlanDetail = async (id) => {
    if (!id) return;
    try {
        const response = await axios.get(`http://localhost:3000/api/detailSupportPlan/${id}`);
        planDetail.value = response.data;
    } catch (error) {
        console.error(`에러`, error);
    }
};

const DeleteTemp = async (planId) => {
    if (!confirm('삭제하시겠습니까?')) return;

    try {
        const response = await axios.delete(`http://localhost:3000/api/deleteSupportPlan/${planId}`);
        if (response.data.status == 'success') {
            alert('삭제되었습니다');
            emit('refresh');
        } else {
            alert('임시파일만 삭제가 가능합니다');
        }
    } catch (error) {
        console.error('삭제중 오류 발생', error);
        alert('통신오류');
    }
};

const Approval = async (planId) => {
    if (!confirm('수정하시겠습니까?')) return;
    try {
        const updateData = {
            plan_objective: planDetail.value.plan_objective,
            plan_content: planDetail.value.plan_content
        };
        const response = await axios.put(`http://localhost:3000/api/updateSupportPlan/${planId}`, updateData);
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

const SaveTemp = async (planId) => {
    if (!confirm('수정하시겠습니까?')) return;
    try {
        const updateData = {
            plan_objective: planDetail.value.plan_objective,
            plan_content: planDetail.value.plan_content
        };
        const response = await axios.put(`http://localhost:3000/api/provisionalUpdate/${planId}`, updateData);
        if (response.data.status == true) {
            alert('임시저장되었습니다');
            emit('refresh');
        } else {
            alert('승인이 신청되지 못했습니다');
        }
    } catch (error) {
        console.error('삭제중 오류 발생', error);
        alert('통신오류');
    }
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
        <hr />
        <div>
            <span>{{ planDetail.progress_state }}</span>
        </div>
        <div>
            <label>작성일:</label>
            <span>{{ planDetail.created_at }}</span>
        </div>
        <div class="form_BfnewPlan">
            <label for="objective">지원목표</label>
            <input id="objective" v-model="planDetail.plan_objective" :readonly="planDetail.progress_state !== '임시'" type="text" class="read-only" />
        </div>
        <div class="form_BfnewPlan">
            <label for="content">계획내용</label>
            <textarea id="content" v-model="planDetail.plan_content" rows="5" :readonly="planDetail.progress_state !== '임시'" class="read-only"></textarea>
        </div>
        <div class="form_BfnewPlan">
            <label for="file">파일첨부</label>
            <input type="text" placeholder="임시" :readonly="planDetail.progress_state !== '임시'" class="read-only" />
        </div>
        <div>
            <button v-if="planDetail.progress_state === '임시'" @click="Approval(planDetail.plan_id)">승인</button>
            <button v-if="planDetail.progress_state === '임시'" @click="SaveTemp(planDetail.plan_id)">임시저장</button>
            <button v-if="planDetail.progress_state === '임시'" @click="DeleteTemp(planDetail.plan_id)">삭제</button>
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

/* 제목 */
h2 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 8px;
    letter-spacing: -0.05em;
}

hr {
    border: none;
    border-top: 2px solid #334155;
    margin-bottom: 10px;
}

/* 상태 표시 (progress_state) */
.BfnewPlan > div:nth-child(3) {
    margin-bottom: 5px;
}

.BfnewPlan > div:nth-child(3) span {
    display: inline-block;
    padding: 4px 12px;
    background-color: #f1f5f9;
    color: #475569;
    border-radius: 15px;
    font-size: 0.85rem;
    font-weight: 700;
}

/* 작성일 영역 */
.BfnewPlan > div:nth-child(4) {
    text-align: right;
    margin-bottom: 20px;
    color: #64748b;
    font-size: 0.95rem;
    padding-bottom: 10px;
}

.BfnewPlan > div:nth-child(4) label {
    font-weight: 600;
    margin-right: 5px;
}

/* 2. 폼 필드 레이아웃 (표 형식) */
.form_BfnewPlan {
    display: flex;
    border-bottom: 1px solid #e2e8f0;
    border-left: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
}

/* 첫 번째 폼 필드(지원목표)에 상단 테두리 추가 */
.form_BfnewPlan:nth-of-type(1) {
    border-top: 1px solid #e2e8f0;
}

/* 라벨 스타일 */
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

/* 읽기 전용 입력창 공통 스타일 */
input[readonly],
textarea[readonly] {
    flex: 1;
    border: none;
    padding: 15px 20px;
    font-size: 1rem;
    color: #334155;
    outline: none;
    background-color: #ffffff; /* 조회시에는 깨끗한 흰색 유지 */
    cursor: default;
}

/* 계획내용 높이 확보 */
textarea[readonly] {
    min-height: 250px;
    line-height: 1.6;
    resize: none;
}

/* 3. 하단 버튼 영역 */
.BfnewPlan > div:last-child {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 30px;
}

/* 버튼 공통 스타일 (알약 모양) */
.BfnewPlan > div:last-child button {
    padding: 12px 24px;
    border-radius: 30px;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
}

/* 승인 버튼 (강조) */
button:nth-child(1) {
    background-color: #1e293b;
    color: #ffffff;
}

button:nth-child(1):hover {
    background-color: #334155;
}

/* 임시저장 버튼 */
button:nth-child(2) {
    background-color: #f1f5f9;
    color: #475569;
}

/* 삭제 버튼 */
button:nth-child(3) {
    background-color: #fff1f2;
    color: #e11d48;
}

button:nth-child(3):hover {
    background-color: #ffe4e6;
}
</style>
