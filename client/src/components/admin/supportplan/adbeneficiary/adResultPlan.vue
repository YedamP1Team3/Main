<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';

const props = defineProps({
    beneId: [String, Number]
});

const emit = defineEmits(['select-result', 'refresh']);
const planList = ref([]);
//const showTemp = ref(false);

const fetchPlanList = async (id) => {
    if (!id) {
        planList.value = [];
        return;
    }
    try {
        const response = await axios.get(`http://localhost:3000/adsupport/admin/beneficiaries/${id}/support-result`);
        planList.value = response.data || [];
    } catch (error) {
        console.error('에러', error);
    }
};

const detailClick = (planId) => {
    emit('select-result', planId);
};

defineExpose({ fetchPlanList });

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
            <h2>지원결과서</h2>
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
                <tr v-for="plan in planList" :key="plan.plan_id" @click="detailClick(plan.result_id)">
                    <td>{{ plan.result_id }}</td>
                    <td>{{ plan.user_name }}</td>
                    <td>{{ plan.result_title }}</td>
                    <td>{{ plan.created_at }}</td>
                    <td>{{ plan.progress_state === '반려/수정중' ? '반려' : plan.progress_state }}</td>
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
/* 3. 테이블 레이아웃 최적화 (600px 기준) */
table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed;
}

th {
    background-color: #fef9f6; /* 헤더에 아주 연한 배경색 추가 */
    color: #64748b;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 12px 10px;
    border-bottom: 2px solid #f4e2de;
}

td {
    padding: 16px 10px;
    font-size: 0.9rem;
    color: #334155;
    border-bottom: 1px solid #f4e2de;
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
