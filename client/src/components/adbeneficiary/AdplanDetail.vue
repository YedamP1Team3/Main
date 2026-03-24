<script setup>
import axios from 'axios';
import { ref, watch } from 'vue';
const emit = defineEmits(['refresh']);

const props = defineProps({ beneId: [String, Number], priorityId: [String, Number], planId: [String, Number] });

const planDetail = ref({});
const reasoninsert = ref(false);
const rejectReason = ref('');

const fetchPlanDetail = async (id) => {
    if (!id) return;
    try {
        const response = await axios.get(`http://localhost:3000/adsupport/AddetailSupportPlan/${id}`);
        planDetail.value = response.data;
    } catch (error) {
        console.error(`에러`, error);
    }
};

const Approval = async (planId) => {
    if (!confirm('수정하시겠습니까?')) return;
    try {
        const response = await axios.put(`http://localhost:3000/adsupport/updateApproval/${planId}`);
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

const updatereturn = async (planId) => {
    if (!confirm('반려하시겠습니까?')) return;
    try {
        const updateData = {
            rejection_reason: rejectReason.value
        };
        const response = await axios.put(`http://localhost:3000/adsupport/updateReturn/${planId}`, updateData);
        if (response.data.status == true) {
            alert('반려신청되었습니다');
            emit('refresh');
        } else {
            alert('승인이 신청되지 못했습니다');
        }
    } catch (error) {
        console.error('오류발생', error);
        alert('통신오류');
    }
};

watch(
    () => props.planId,
    (newId) => {
        fetchPlanDetail(newId);
        reasoninsert.value = false;
    },
    { immediate: true }
);
</script>
<template>
    <div class="BfnewPlan">
        <h2>지원계획서 승인여부</h2>
        <hr />
        <div>
            <span>{{ planDetail.progress_state }}</span>
        </div>
        <div>
            <label>작성자:</label>
            <span>{{ planDetail.manager_name }}</span>
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
            <label>파일첨부</label>
            <input type="text" placeholder="임시" :readonly="planDetail.progress_state !== '임시'" class="read-only" />
        </div>
        <div class="button_first">
            <button v-if="planDetail.progress_state === '대기'" class="btn-approve" @click="Approval(planDetail.plan_id)">승인</button>
            <button v-if="planDetail.progress_state === '대기'" class="btn-reject" @click="reasoninsert = true">반려</button>
        </div>

        <div v-if="reasoninsert || planDetail.progress_state == '반려'" class="reason-area">
            <label class="reasonFont">반려사유</label>
            <textarea v-model="rejectReason" rows="4" class="reasonText" placeholder="반려사유를 입력하세요" :disabled="planDetail.progress_state === '반려'"></textarea>
            <button v-if="planDetail.progress_state === '대기'" class="btn-save" @click="updatereturn(planDetail.plan_id)">반려사유저장</button>
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

/* 제목 및 구분선 */
h2 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 8px;
}

hr {
    border: none;
    border-top: 2px solid #334155;
    margin-bottom: 20px;
}

/* 2. 폼 레이아웃 (기존 스타일 유지) */
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
    padding: 15px;
    outline: none;
    background-color: #ffffff;
}

/* 3. 승인/반려 버튼 영역 (button_first) */
/* 승인/반려 버튼이 있는 첫 번째 줄 */
/* 버튼들을 감싸는 영역 - 오른쪽 정렬 및 간격 */
.button_first {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 30px;
}

/* 모든 버튼의 공통 디자인 (알약 모양) */
.button_first button,
.btn-save {
    padding: 10px 25px;
    border-radius: 30px; /* 둥근 모양 */
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    border: none; /* 기본 테두리 제거 */
    transition: 0.2s;
}

/* 승인 버튼 디자인 (진한 남색/검정) */
.btn-approve {
    background-color: #1e293b;
    color: #ffffff;
}

/* 반려 버튼 디자인 (테두리 있는 빨간색 계열) */
.btn-reject {
    background-color: #ffffff;
    color: #e11d48;
    border: 1px solid #e11d48 !important; /* 강제로 테두리 적용 */
}

/* 반려사유 저장 버튼 (진한 빨간색) */
.btn-save {
    background-color: #e11d48;
    color: white;
    margin-top: 10px;
    float: right; /* 오른쪽 정렬 */
}

/* 마우스 올렸을 때 효과 */
button:hover {
    opacity: 0.8;
    transform: translateY(-1px);
}

/* 반려사유 입력창 영역 */
.reason-area {
    margin-top: 40px;
    clear: both; /* float 해제 */
}

.reasonFont {
    display: block;
    color: #e11d48;
    font-weight: bold;
    margin-bottom: 10px;
}

.reasonText {
    width: 100%;
    padding: 15px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    resize: none;
}
</style>
