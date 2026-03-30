<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';

const props = defineProps({
    beneId: [String, Number]
});

const emit = defineEmits(['select-plan']);
const planList = ref([]);

const fetchPlanList = async (id) => {
    if (!id) {
        planList.value = [];
        return;
    }
    try {
        const response = await axios.get(`api/api/beneficiaries/${id}/support-plan`);
        planList.value = response.data || [];
    } catch (error) {
        console.error('에러', error);
    }
};

const detailClick = (planId) => {
    emit(`select-plan`, planId);
};

watch(
    () => props.beneId,
    (newId) => {
        fetchPlanList(newId);
    },
    { immediate: true }
);
</script>
<template>
    <div>
        <div>
            <h2>지원계획서</h2>
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
                <template v-for="plan in planList" :key="plan.plan_id">
                    <tr v-if="plan.progress_state === '승인'" @click="detailClick(plan.plan_id)">
                        <td>{{ plan.plan_id }}</td>
                        <td>{{ plan.manager_id }}</td>
                        <td>{{ plan.plan_objective }}</td>
                        <td>{{ plan.created_at }}</td>
                        <td>{{ plan.progress_state }}</td>
                    </tr>
                </template>
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
</style>
