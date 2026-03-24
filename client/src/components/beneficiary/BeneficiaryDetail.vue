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
        <div>
            <div v-if="planDetail.progress_state == '반려'" class="reason-area">
                <label class="reasonFont">반려사유</label>
                <textarea :value="planDetail.rejection_reason" rows="4" class="reasonText" :disabled="planDetail.progress_state === '반려'" readonly></textarea>
            </div>
        </div>
    </div>
</template>
<style scoped>
.BfnewPlan {
    max-width: 900px;
    margin: 0 auto;
    padding: 30px;
    background-color: #ffffff;
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
    margin-bottom: 10px;
}

/* 상태 표시 및 작성일 */
.BfnewPlan > div:nth-child(3) span {
    display: inline-block;
    padding: 4px 12px;
    background-color: #f1f5f9;
    color: #475569;
    border-radius: 15px;
    font-size: 0.85rem;
    font-weight: 700;
}

.BfnewPlan > div:nth-child(4) {
    text-align: right;
    margin-bottom: 20px;
    color: #64748b;
    font-size: 0.95rem;
}

/* 2. 기존 폼 필드 레이아웃 (표 형식 유지) */
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
}

input[readonly],
textarea[readonly] {
    flex: 1;
    border: none;
    padding: 15px 20px;
    background-color: #ffffff;
    outline: none;
}

/* --- 반려사유 영역 전체 교체 --- */

.reason-area {
    margin-top: 40px;
    width: 100%; /* 전체 너비 확보 */
    clear: both; /* 이전 요소들의 float 영향 제거 */
    display: block; /* 블록 요소로 명시 */
}

.reasonFont {
    display: block;
    color: #e11d48;
    font-weight: 800; /* 더 두껍게 */
    font-size: 1.1rem;
    margin-bottom: 12px;
    text-align: left; /* 왼쪽 정렬 고정 */
}

.reasonText {
    width: 100%; /* 왼쪽 화면에서도 꽉 차게 만듭니다 */
    min-height: 140px;
    padding: 20px; /* 내부 여백 넉넉히 */
    border: 1px solid #e2e8f0;
    border-radius: 12px; /* 오른쪽 이미지처럼 부드러운 라운딩 */
    background-color: #ffffff;
    color: #475569;
    font-size: 1rem;
    line-height: 1.6;
    resize: none;
    outline: none;
    box-sizing: border-box; /* 패딩이 너비에 영향을 주지 않도록 설정 */
}

/* 조회용(readonly)일 때도 배경색을 흰색으로 고정하여 깔끔하게 유지 */
.reasonText[readonly] {
    background-color: #ffffff;
    cursor: default;
}

/* 4. 하단 버튼 영역 (알약 모양 유지) */
.BfnewPlan > div:last-child {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 30px;
}

.BfnewPlan > div:last-child button {
    padding: 12px 24px;
    border-radius: 30px;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    border: none;
}

button:nth-child(1) {
    background-color: #1e293b;
    color: #ffffff;
}
button:nth-child(2) {
    background-color: #f1f5f9;
    color: #475569;
}
button:nth-child(3) {
    background-color: #fff1f2;
    color: #e11d48;
}
</style>
