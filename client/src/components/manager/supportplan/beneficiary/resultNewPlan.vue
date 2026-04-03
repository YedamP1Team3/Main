<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({ beneId: [String, Number], priorityId: [String, Number] });
const emit = defineEmits(['newresultplan', 'refresh', 'savetem']);
const authStore = useAuthStore();

const resultTitle = ref(''); //목표저장
const resultContent = ref(''); //내용저장
const today = new Date().toLocaleDateString(); //작성일
const supportList = ref([]);
const supportPlan = ref('');
const selectedPlans = ref([]);
const isSubmitting = ref(false);

const Approval = async () => {
    if (isSubmitting.value) return;
    if (!resultTitle.value || !resultContent.value) {
        alert('내용을 입력해주세요');
        return;
    }

    if (selectedPlans.value.length === 0) {
        alert('연결된 지원계획서가 없습니다. 결과에 포함할 계획을 선택해주세요.');
        return;
    }

    const target = {
        manager_id: authStore.userId,
        bene_id: props.beneId,
        result_title: resultTitle.value,
        result_content: resultContent.value,
        progress_state: '대기',
        selected_plans: selectedPlans.value
    };
    try {
        isSubmitting.value = true;
        const response = await axios.post('api/resultPlan/support-result', target);
        if (response.data.success) {
            alert('지원서가 입력되었습니다');
            emit('refresh');
        }
    } catch (error) {
        console.error('데이터 전송 중 에러', error);
        alert('서버오류');
    } finally {
        isSubmitting.value = false;
    }
};

const SaveTemp = async () => {
    if (!resultTitle.value || !resultContent.value) {
        alert('내용을 입력해주세요');
        return;
    }
    if (isSubmitting.value) return;
    const target = {
        manager_id: authStore.userId,
        bene_id: props.beneId,
        result_title: resultTitle.value,
        result_content: resultContent.value,
        progress_state: '임시',
        selected_plans: selectedPlans.value
    };
    try {
        isSubmitting.value = true;
        const response = await axios.post('api/resultPlan/temp-result', target);
        if (response.data.success) {
            alert('지원서가 입력되었습니다');
            emit('refresh');
        }
    } catch (error) {
        console.error('데이터 전송 중 에러', error);
        alert('서버오류');
    } finally {
        isSubmitting.value = false;
    }
};

const Plus = () => {
    // 선택 여부 체크
    if (!supportPlan.value) {
        alert('계획을 선택해주세요');
        return;
    }

    // 중복 체크
    const isExist = selectedPlans.value.some((p) => p.plan_id === supportPlan.value);
    if (isExist) {
        alert('이미 추가된 계획입니다');
        return;
    }

    // 객체 찾아서 추가
    const target = supportList.value.find((p) => p.plan_id === supportPlan.value);
    if (target) {
        selectedPlans.value.push(target);
        supportPlan.value = ''; // 선택창 초기화
    }
};

// 2. 삭제 함수: Plus 함수 "바깥"으로 꺼냈습니다. (중요!)
const removePlan = (id) => {
    selectedPlans.value = selectedPlans.value.filter((p) => p.plan_id !== id);
};

// 3. 템플릿에 @change="fetchSupportPlan"이 있으므로 선언해둡니다.
const fetchSupportPlan = () => {
    console.log('계획 선택됨:', supportPlan.value);
};

onMounted(async () => {
    const response = await axios.get(`http://localhost:3000/resultPlan/support-plans/approved/${props.beneId}`);
    supportList.value = response.data;
});
</script>
<template>
    <div class="BfnewPlan">
        <h2>지원계획서 입력하기</h2>

        <div class="date-section">
            <label>작성일:</label>
            <span>{{ today }}</span>
        </div>

        <div class="form-container">
            <div class="form_BfnewPlan">
                <label for="objective">지원목표</label>
                <input id="objective" v-model="resultTitle" placeholder="목표를 입력해주세요" type="text" />
            </div>

            <div class="form_BfnewPlan">
                <label for="content">계획내용</label>
                <textarea id="content" v-model="resultContent" placeholder="지원계획 내용을 입력해주세요"></textarea>
            </div>

            <div class="form_BfnewPlan">
                <label for="file">파일첨부</label>
                <input type="text" placeholder="임시" readonly />
            </div>

            <div class="form_BfnewPlan">
                <label for="plan">계획서 추가</label>
                <div class="select-group">
                    <select v-model="supportPlan" class="custom-select">
                        <option value="">계획서를 선택하세요</option>
                        <option v-for="plan in supportList" :key="plan.plan_id" :value="plan.plan_id">
                            {{ plan.plan_objective }}
                        </option>
                    </select>
                    <button type="button" class="btn-plus" @click="Plus">+</button>
                </div>
            </div>

            <div v-if="selectedPlans.length > 0" class="form_BfnewPlan selected-plans-row">
                <label>선택된 계획</label>
                <div class="selected-plans-container">
                    <div v-for="item in selectedPlans" :key="item.plan_id" class="plan-tag">
                        <span>{{ item.plan_objective }}</span>
                        <button type="button" @click="removePlan(item.plan_id)" class="btn-remove">X</button>
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
/* 1. 전체 컨테이너 및 기본 폰트 */
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

.date-section {
    text-align: right;
    margin-bottom: 20px;
    color: #64748b;
    font-size: 1.1rem;
    border-bottom: 2px solid #334155;
    padding-bottom: 10px;
}

/* 2. 표 형식 레이아웃 */
.form-container {
    border-top: 1px solid #f4e2de;
}

.form_BfnewPlan {
    display: flex;
    border-bottom: 1px solid #f4e2de;
    border-left: 1px solid #f4e2de;
    border-right: 1px solid #f4e2de;
}

.form_BfnewPlan label {
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

/* 🌟 입력 필드 스타일 교정 (템플릿의 id/태그 기준) */
.form_BfnewPlan input[type='text'],
.form_BfnewPlan textarea,
.form_BfnewPlan .custom-select {
    flex: 1;
    border: none;
    padding: 15px 20px;
    font-size: 1.1rem;
    color: #334155;
    outline: none;
    background-color: transparent;
    width: 100%;
}

.form_BfnewPlan textarea {
    min-height: 200px;
    line-height: 1.6;
    resize: none;
}

/* 3. 셀렉트 박스 및 플러스 버튼 영역 */
.select-group {
    flex: 1;
    display: flex;
    align-items: center;
    padding-right: 15px;
}

.custom-select {
    cursor: pointer;
    appearance: none;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")
        no-repeat right 15px center;
    background-size: 15px;
}

.btn-plus {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    border: 1px solid #1e293b !important;
    background-color: #fff;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.btn-plus:hover {
    background-color: #1e293b;
    color: #fff;
}

/* 4. 선택된 계획 태그 영역 */
.selected-plans-container {
    flex: 1;
    display: flex;
    gap: 10px;
    padding: 10px 20px;
    flex-wrap: wrap;
    align-items: center;
}

.plan-tag {
    display: flex;
    align-items: center;
    background-color: #eff6ff; /* 사진처럼 살짝 푸른 빛 */
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 1.1rem;
    color: #1e40af;
    border: 1px solid #dbeafe;
}

.btn-remove {
    margin-left: 8px;
    border: none;
    background: none;
    color: #ef4444;
    font-weight: bold;
    cursor: pointer;
    padding: 0;
}

/* 5. 하단 버튼 디자인 (이미지 기준) */
/* 5. 하단 버튼 디자인 (우측 정렬로 수정) */
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

button:first-of-type:hover {
    background-color: #ff8a65;
    transform: translateY(-1px); /* 조금 더 확실한 상승감 */
    /* 버튼 색상과 맞춘 부드러운 그림자 */
    box-shadow: 0 10px 15px -3px rgba(255, 171, 145, 0.4);
}

.btn-temp {
    background: #ffffff;
    border: 2px solid #ffab91 !important;
    color: #ffab91;
}
button:last-of-type:not(.active-temp):hover {
    background-color: #ffab91; /* 아주 연한 주황 배경 */
    color: #ffffff;
    border-color: #ff8a65;
    box-shadow: 0 4px 6px rgba(255, 171, 145, 0.1);
}
</style>
