<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';

const props = defineProps({
    beneId: [String, Number]
});

const emit = defineEmits(['select-result']);
const resultList = ref([]);

const fetchResultList = async (id) => {
    if (!id) {
        resultList.value = [];
        return;
    }
    try {
        // 1. 여기서 먼저 데이터를 받아와서 response 변수에 담습니다.
        const response = await axios.get(`/api/resultPlan/beneficiaries/${id}/support-result`);

        // 2. [수정 포인트] 이제 데이터가 들어왔으니 로그를 찍습니다.
        console.log('서버 응답 데이터:', response.data);

        resultList.value = response.data || [];

        if (resultList.value.length > 0) {
            const states = resultList.value.map((plan) => plan.progress_state);
            console.log('현재 데이터들의 상태값들:', states);
        }
    } catch (error) {
        console.error('에러', error);
    }
};

const detailClick = (Id) => {
    emit(`select-result`, Id);
};

watch(
    () => props.beneId,
    (newId) => {
        fetchResultList(newId);
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
                </tr>
                <template v-for="plan in resultList" :key="plan.result_id">
                    <tr v-if="plan.progress_state === '승인'" @click="detailClick(plan.result_id)">
                        <td>{{ plan.result_id }}</td>
                        <td>{{ plan.manager_name }}</td>
                        <td>{{ plan.result_title }}</td>
                        <td>{{ plan.created_at }}</td>
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
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    letter-spacing: -0.025em;
    margin: 0;
}

/* 3. 테이블 레이아웃 최적화 (600px 기준) */
table {
    padding-top: 10px;
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed;
}

th {
    background-color: #fef9f6; /* 헤더에 아주 연한 배경색 추가 */
    color: #64748b;
    font-size: 1.1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 12px 10px;
    border-bottom: 2px solid #f4e2de;
}

td {
    padding: 16px 10px;
    font-size: 1.1rem;
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
</style>
