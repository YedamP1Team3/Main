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
        console.log(planDetail.value);
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
            <input id="objective" v-model="planDetail.plan_objective" :readonly="!['임시', '반려'].includes(planDetail.progress_state)" type="text" class="read-only" />
        </div>
        <div class="form_BfnewPlan">
            <label for="content">계획내용</label>
            <textarea id="content" v-model="planDetail.plan_content" rows="5" :readonly="!['임시', '반려'].includes(planDetail.progress_state)" class="read-only"></textarea>
        </div>
        <div class="form_BfnewPlan">
            <label for="file">파일첨부</label>
            <input type="text" placeholder="임시" :readonly="planDetail.progress_state !== '임시'" class="read-only" />
        </div>
        <div>
            <button v-if="['임시', '반려'].includes(planDetail.progress_state)" class="btn-approve" @click="Approval(planDetail.plan_id)">승인</button>
            <button v-if="['임시', '반려'].includes(planDetail.progress_state)" class="btn-temp" @click="SaveTemp(planDetail.plan_id)">임시저장</button>
            <button v-if="planDetail.progress_state === '임시'" class="btn-delete" @click="DeleteTemp(planDetail.plan_id)">삭제</button>
        </div>
        <div v-if="planDetail.progress_state == '반려'" class="reason-area"></div>
        <div>
            <div v-if="planDetail.progress_state === '반려' || (planDetail.progress_state === '임시' && planDetail.rejection_reason)" class="reason-area">
                <label class="reasonFont">반려사유</label>
                <textarea :value="planDetail.rejection_reason" rows="4" class="reasonText" :disabled="planDetail.progress_state === '반려'" readonly></textarea>
            </div>
        </div>
    </div>
</template>
<style scoped>
/* 1. 기본 레이아웃 및 폰트 */
.BfnewPlan {
    max-width: 900px;
    margin: 0 auto;
    padding: 30px;
    background-color: #ffffff;
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
    letter-spacing: -0.05em;
}

hr {
    border: none;
    border-top: 2px solid #334155;
    margin-bottom: 15px;
}

/* 상태 표시 배지 */
.BfnewPlan > div:nth-child(3) span {
    display: inline-block;
    padding: 4px 12px;
    background-color: #f1f5f9;
    color: #475569;
    border-radius: 15px;
    font-size: 0.85rem;
    font-weight: 700;
}

/* 작성일 우측 정렬 */
.BfnewPlan > div:nth-child(4) {
    text-align: right;
    margin-bottom: 20px;
    color: #64748b;
    font-size: 0.95rem;
}

/* 2. 테이블 형태의 폼 레이아웃 */
.form_BfnewPlan {
    display: flex;
    border-bottom: 1px solid #e2e8f0;
    border-left: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
}

.form_BfnewPlan:nth-of-type(1) {
    border-top: 1px solid #e2e8f0;
}

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

/* 입력창 및 텍스트 영역 */
input[readonly],
textarea[readonly],
input[v-model],
textarea[v-model] {
    flex: 1;
    border: none;
    padding: 15px 20px;
    font-size: 1rem;
    color: #334155;
    outline: none;
    background-color: #ffffff;
}

textarea {
    min-height: 180px;
    line-height: 1.6;
    resize: none;
}

/* 3. 버튼 영역 (클래스 직접 지정으로 꼬임 방지) */
.BfnewPlan > div:nth-last-child(2) {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 30px;
    margin-bottom: 10px;
}

/* 모든 버튼 공통 스타일 */
.BfnewPlan button {
    padding: 12px 24px;
    border-radius: 30px;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
}

/* 버튼별 고유 색상 (클래스명 기준) */
.btn-approve {
    background-color: #1e293b !important;
    color: #ffffff !important;
}

.btn-temp {
    background-color: #f1f5f9 !important;
    color: #475569 !important;
}

.btn-delete {
    background-color: #fff1f2 !important;
    color: #e11d48 !important;
}

button:hover {
    opacity: 0.8;
    transform: translateY(-1px);
}

/* 4. 반려 사유 영역 (이미지 느낌 100% 재현) */
.reason-area {
    margin-top: 40px;
    width: 100%;
    clear: both;
}

.reasonFont {
    display: block;
    color: #e11d48; /* 이미지의 붉은색 */
    font-weight: 800;
    font-size: 1.1rem;
    margin-bottom: 12px;
    text-align: left;
}

.reasonText {
    width: 100%;
    min-height: 140px;
    padding: 20px;
    border: 1.5px solid #e2e8f0; /* 부드러운 테두리 */
    border-radius: 12px; /* 이미지의 둥근 모서리 */
    background-color: #ffffff;
    color: #475569;
    font-size: 1rem;
    line-height: 1.6;
    resize: none;
    outline: none;
    box-sizing: border-box; /* 너비 100% 고정 핵심 */
}

/* readonly 상태에서도 깨끗한 흰색 유지 */
.reasonText[readonly] {
    background-color: #ffffff;
    cursor: default;
}
</style>
