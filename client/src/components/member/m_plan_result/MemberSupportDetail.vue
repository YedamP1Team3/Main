<script setup>
import axios from 'axios';
import { ref, watch } from 'vue';
const props = defineProps({ beneId: [String, Number], priorityId: [String, Number], planId: [String, Number] });

const attachments = ref([]);
const planDetail = ref(null);

const fetchPlanDetail = async (id) => {
    if (!id) return;
    try {
        const response = await axios.get(`/api/support-plans/${id}`);
        console.log('서버 응답 데이터:', response.data);

        // 핵심 수정: response.data가 아니라 response.data.plan에 접근해야 합니다.
        // 콘솔 데이터 구조가 { plan: {...}, files: [...] } 이기 때문입니다.
        planDetail.value = response.data.plan;

        // 첨부파일도 response.data.files로 바로 할당합니다.
        attachments.value = response.data.files || [];
    } catch (error) {
        console.error('에러 상세:', error);
        planDetail.value = null; // 에러 시 null로 처리하여 v-else(로딩/에러)가 뜨게 함
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
    <div v-if="planDetail" class="BfnewPlan">
        <h2>지원계획서 조회</h2>
        <hr />

        <div class="plan-header">
            <span class="date-info">작성일: {{ planDetail.created_at }}</span>
        </div>

        <table class="detail-table">
            <colgroup>
                <col style="width: 20%" />
                <col style="width: 80%" />
            </colgroup>
            <tbody>
                <tr>
                    <th>지원목표</th>
                    <td>{{ planDetail.plan_objective }}</td>
                </tr>
                <tr>
                    <th>계획내용</th>
                    <td class="content-cell">
                        <div class="text-wrapper">{{ planDetail.plan_content }}</div>
                    </td>
                </tr>
                <tr>
                    <th>파일첨부</th>
                    <td class="file-cell">
                        <div v-if="attachments && attachments.length > 0">
                            <div v-for="file in attachments" :key="file.file_id" class="file-item">{{ file.origin_name }}</div>
                        </div>
                        <div v-else class="no-file">첨부파일 없음</div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div v-else class="loading-state">데이터를 불러오는 중입니다...</div>
</template>
<style scoped>
.BfnewPlan {
    max-width: 1000px;
    background-color: #fff;
    border: 2px solid #f4e2de;
    margin: 30px auto;
    padding: 0 20px;
    color: #333;
    padding: 30px;
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
