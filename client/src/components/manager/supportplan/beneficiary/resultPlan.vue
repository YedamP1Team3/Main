<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';

const props = defineProps({
    beneId: [String, Number],
    // progress_state: String,
    progressStatus: { type: [String, Number] }
});

const emit = defineEmits(['newresultplan', 'select-result', 'refresh']);
const planList = ref([]);
const showTemp = ref(false);

const fetchPlanList = async (id) => {
    if (!id) {
        planList.value = [];
        return;
    }
    try {
        const url = showTemp.value ? `api/resultPlan/beneficiaries/${id}/temp` : `api/resultPlan/beneficiaries/${id}/support-result`;
        const response = await axios.get(url);
        planList.value = response.data || [];
    } catch (error) {
        console.error('에러', error);
    }
};

function addNewPlan() {
    if (!props.beneId) {
        alert('지원자를 클릭해주세요');
        return;
    }
    if (props.progressStatus !== 'approved') {
        alert('현재단계에서는 지원결과서를 신청하지 못합니다');
        return;
    }
    emit('newresultplan');
}
const savefile = () => {
    if (!props.beneId) {
        alert('지원자를 클릭해주세요');
        return;
    }
    showTemp.value = !showTemp.value;
    fetchPlanList(props.beneId);
};

const detailClick = (plan) => {
    const id = showTemp.value ? plan.result_draft_id : plan.result_id;
    emit('select-result', {
        resultId: id,
        isTemp: showTemp.value
    });
};

defineExpose({ fetchPlanList });

watch(
    () => props.beneId,
    (newId) => {
        showTemp.value = false;
        fetchPlanList(newId);
    },
    { immediate: true }
);
</script>
<template>
    <div>
        <div>
            <h2>지원결과서</h2>
            <button @click="addNewPlan">+추가하기</button>
            <button @click="savefile" :class="{ 'active-temp': showTemp }" class="btn-temp-check">{{ showTemp ? '일반 목록' : '임시저장' }}</button>
        </div>
        <table>
            <tbody>
                <tr>
                    <th>no</th>
                    <th>작성자</th>
                    <th>목표</th>
                    <th>작성일자</th>
                    <th>상태</th>
                </tr>
                <tr v-for="plan in planList" :key="showTemp ? plan.result_draft_id : plan.result_id" @click="detailClick(plan)" class="clickable-row">
                    <td>{{ showTemp ? plan.result_draft_id : plan.result_id }}</td>
                    <td>{{ plan.manager_id }}</td>
                    <td>{{ plan.result_title }}</td>
                    <td>{{ plan.created_at }}</td>
                    <td>{{ plan.progress_state }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<style scoped>
/* 1. 상단 헤더 영역 */
.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 0 4px;
}

h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    letter-spacing: -0.025em;
    margin: 0;
}

/* 2. 버튼 디자인 (현대적인 둥근 스타일) */
.btn-group {
    display: flex;
    gap: 10px;
}

button {
    padding: 8px 16px;
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: 8px; /* 조금 더 둥글게 */
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

/* [+추가하기] 버튼 - 메인 포인트 컬러 */
button:first-of-type {
    background-color: #3b82f6; /* 신뢰감 있는 블루 */
    color: #ffffff;
    border: 1px solid #3b82f6;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

button:first-of-type:hover {
    background-color: #2563eb;
    border-color: #2563eb;
    transform: translateY(-1px); /* 살짝 떠오르는 효과 */
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* [임시저장] 버튼 - 차분한 보조 컬러 */
button:last-of-type {
    background-color: #ffffff;
    color: #475569;
    border: 1px solid #e2e8f0;
}
/*임시저장 버튼을 눌렀을때 화면 표시*/
.active-temp {
    background-color: #fff7ed; /* 연한 주황 배경 */
    border-color: #fb923c; /* 진한 주황 테두리 */
    color: #ea580c; /* 진한 주황 글씨 */
    box-shadow: 0 0 8px rgba(251, 146, 60, 0.3); /* 살짝 빛나는 효과 */
    font-weight: bold;
}

button:last-of-type:hover {
    background-color: #f8fafc;
    color: #1e293b;
    border-color: #cbd5e1;
}

/* 3. 테이블 레이아웃 최적화 (600px 기준) */
table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed;
}

th {
    background-color: #f8fafc; /* 헤더에 아주 연한 배경색 추가 */
    color: #64748b;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 12px 10px;
    border-bottom: 2px solid #e2e8f0;
}

td {
    padding: 16px 10px;
    font-size: 0.9rem;
    color: #334155;
    border-bottom: 1px solid #f1f5f9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 컬럼 너비 및 정렬 정밀 조정 */
th:nth-child(1),
td:nth-child(1) {
    width: 45px;
    text-align: center;
} /* 순번 */
th:nth-child(2),
td:nth-child(2) {
    width: 80px;
} /* 작성자 */
th:nth-child(3),
td:nth-child(3) {
    width: auto;
} /* 목표 */
th:nth-child(4),
td:nth-child(4) {
    width: 110px;
    text-align: center;
} /* 작성일자 */
th:nth-child(5),
td:nth-child(5) {
    width: 85px;
    text-align: center;
    padding-right: 10px; /* 오른쪽 치우침 방지 */
}

/* 행 호버 효과 */
tr:hover td {
    background-color: #f1f5f9;
    cursor: pointer;
}

/* 4. 상태 텍스트 가독성 향상 */
td:last-child {
    font-weight: 600;
    color: #3b82f6; /* 기본적으로 포인트 컬러 적용 */
}

/* 반려 히스토리 섹션 (관리자용 디자인 계승) */
.history-section {
    margin-top: 50px;
}

.history-title {
    font-size: 1.2rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 15px;
}

.history-card {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 18px;
    margin-bottom: 12px;
}

.history-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    border-bottom: 1px dashed #cbd5e1;
    padding-bottom: 8px;
}

.history-user {
    font-weight: 700;
    color: #475569;
    font-size: 0.9rem;
}

.history-date {
    font-size: 0.85rem;
    color: #94a3b8;
}

.history-body {
    color: #334155;
    line-height: 1.6;
    font-size: 0.95rem;
    white-space: pre-wrap;
}
</style>
