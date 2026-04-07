<script setup>
import axios from 'axios';
import { ref, watch } from 'vue';
const props = defineProps({ beneId: [String, Number], priorityId: [String, Number], resultId: [String, Number] });

const attachments = ref([]);
const resultDetail = ref({});

const fetchResultDetail = async (id) => {
    if (!id) return;
    try {
        const response = await axios.get(`/api/resultPlan/support-result/${id}`);
        resultDetail.value = response.data;
        attachments.value = response.data.files || [];
    } catch (error) {
        console.error(`에러`, error);
    }
};

const downloadFile = (file) => {
    const isConfirmed = confirm(`'${file.origin_name}' 파일을 다운로드하시겠습니까?`);
    if (isConfirmed) {
        const url = `/api/download/${file.file_name}?originName=${encodeURIComponent(file.origin_name)}`;
        window.location.href = url;
    }
};

const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();

    if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
        return '🖼️';
    }

    const iconMap = {
        pdf: '📕',
        xlsx: '📗',
        xls: '📗',
        docx: '📘',
        doc: '📘',
        hwp: '📝'
    };

    return iconMap[ext] || '📄';
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
                    <td class="file-cell">
                        <ul v-if="attachments && attachments.length > 0" class="file_list">
                            <li v-for="file in attachments" :key="file.file_id" class="file_item clickable" @click="downloadFile(file)">
                                <span class="file_icon">{{ getFileIcon(file.origin_name || file.name) }}</span>
                                <span class="file_name">{{ file.origin_name || file.name }}</span>
                            </li>
                        </ul>

                        <div v-else class="no-file">첨부파일 없음</div>
                    </td>
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
    border-top: 1px solid #f4e2de;
    border-bottom: 1px solid #f4e2de;
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
    border: 1px solid #f4e2de;
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
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}
.file_list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.file_item {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    background-color: #ffffff;
    border: 1px solid #ff8a65;
    border-radius: 12px;
    margin-bottom: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
    min-width: 200px;
    transition: all 0.2s;
}

.file_item:hover {
    border-color: #ff8a65;
    color: white;
    background-color: #ff8a65;
}

.file_icon {
    font-size: 1.1rem;
    margin-right: 10px;
    display: flex;
    align-items: center;
    line-height: 1;
}

.file_name {
    flex: 1;
    font-size: 1.1rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.btn_file_select {
    width: fit-content;
    padding: 10px 15px;
    border: 1px solid #ff8a65 !important;
    background-color: #ffffff;
    color: #ff8a65;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
}

.btn_file_select:hover {
    background-color: #1d4ed8;
}

.btn_remove {
    background: #f1f5f9;
    border: none;
    color: #64748b;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-size: 1.1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.btn_remove:hover {
    background-color: #fee2e2;
    color: #ef4444;
}

.no-attachments {
    color: #94a3b8;
    font-size: 1.1rem;
    padding: 5px 0;
}

.clickable {
    cursor: pointer;
}
</style>
