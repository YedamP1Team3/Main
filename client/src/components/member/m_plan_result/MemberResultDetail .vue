<script setup>
import axios from 'axios';
import { ref, watch } from 'vue';
const props = defineProps({ beneId: [String, Number], priorityId: [String, Number], resultId: [String, Number] });

const resultDetail = ref({});

const fetchResultDetail = async (id) => {
    if (!id) return;
    try {
        const response = await axios.get(`api/resultPlan/support-result/${id}`);
        resultDetail.value = response.data;
    } catch (error) {
        console.error(`에러`, error);
    }
};

watch(
    () => props.resultId,
    (newId) => {
        fetchResultDetail(newId);
    },
    { immediate: true }
);
</script>
<template>
    <div class="BfnewPlan">
        <h2>지원결과서 조회</h2>
        <hr />

        <div class="plan-header">
            <span class="date-info">작성일: {{ resultDetail.created_at }}</span>
        </div>

        <table class="detail-table">
            <colgroup>
                <col style="width: 20%" />
                <col style="width: 80%" />
            </colgroup>
            <tbody>
                <tr>
                    <th>지원목표</th>
                    <td>{{ resultDetail.result_title }}</td>
                </tr>
                <tr>
                    <th>계획내용</th>
                    <td class="content-cell">
                        <div class="text-wrapper">{{ resultDetail.result_content }}</div>
                    </td>
                </tr>
                <tr>
                    <th>파일첨부</th>
                    <td class="file-cell">임시 (첨부파일 없음)</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<style scoped>
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
    margin-bottom: 10px;
}

hr {
    border: 0;
    border-top: 2px solid #f4e2de;
    margin-bottom: 20px;
}

/* 상단 정보 스타일 */
.plan-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 15px;
    align-items: center;
}

.status-badge {
    background-color: #e8f5e9;
    color: #2e7d32;
    padding: 4px 12px;
    border-radius: 15px;
    font-weight: bold;
    font-size: 1.1rem;
}

.date-info {
    font-size: 1.1rem;
    color: #666;
}

/* 테이블 스타일 */
.detail-table {
    width: 100%;
    border-collapse: collapse;
    border-top: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    table-layout: fixed;
    font-size: 1.1rem;
}

.detail-table th {
    background-color: #fef9f6; /* 담당자 화면과 동일한 회색 배경 */
    border: 1px solid #f4e2de;
    padding: 15px;
    text-align: left;
    font-weight: bold;
}

.detail-table td {
    border: 1px solid #ddd;
    padding: 15px;
    text-align: left;
    background-color: #fff;
    line-height: 1.6;
}

/* 계획내용 셀 높이 조절 */
.content-cell {
    height: 300px; /* 왼쪽 화면과 비슷한 높이 */
    vertical-align: top;
}

.text-wrapper {
    white-space: pre-wrap; /* 줄바꿈 유지 */
    word-break: break-all;
}

.file-cell {
    color: #999;
    font-style: italic;
}
</style>
