<script setup>
import axios from 'axios';
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
    planId: [String, Number] // 부모로부터 받은 계획서 ID
});

const emit = defineEmits(['close']); // 목록으로 돌아가기 위한 이벤트

const attachments = ref([]);
const planDetail = ref({});
const isLoading = ref(false);

// 1. 상세 데이터 가져오기 함수
const fetchPlanDetail = async (id) => {
    if (!id) return;

    isLoading.value = true;
    try {
        // ✅ API 주소 주의: 서버 포트(3000)와 경로를 명확히 작성
        const response = await axios.get(`api/api/support-plans/${id}`);
        planDetail.value = response.data.plan || {};
        attachments.value = response.data.files || [];

        console.log('계획서 상세 로드 성공:', planDetail.value);
    } catch (error) {
        console.error('상세 데이터를 불러오는 중 에러 발생:', error);
        alert('데이터를 불러오지 못했습니다.');
    } finally {
        isLoading.value = false;
    }
};

const downloadFile = (file) => {
    const isConfirmed = confirm(`'${file.origin_name}' 파일을 다운로드하시겠습니까?`);
    if (isConfirmed) {
        const url = `api/download/${file.file_name}?originName=${encodeURIComponent(file.origin_name)}`;

        console.log('다운로드 시작:', file.origin_name);
        window.location.href = url;
    }
};

// 2. 컴포넌트가 마운트되거나 planId가 바뀔 때마다 데이터 다시 호출
onMounted(() => fetchPlanDetail(props.planId));
watch(
    () => props.planId,
    (newId) => fetchPlanDetail(newId)
);

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
</script>

<template>
    <div class="detail-container">
        <div class="detail-header">
            <h3>지원계획서 상세 정보</h3>
            <button class="btn-close" @click="emit('close')">목록으로 돌아가기</button>
        </div>

        <div v-if="isLoading" class="loading-msg">데이터를 불러오는 중...</div>

        <div v-else-if="planDetail.plan_id" class="detail-content">
            <table class="detail-table">
                <tbody>
                    <tr>
                        <th>NO</th>
                        <td>{{ planDetail.plan_id }}</td>
                        <th>작성일자</th>
                        <td>{{ planDetail.created_at }}</td>
                    </tr>
                    <tr>
                        <th>담당자</th>
                        <td>{{ planDetail.manager_id }}</td>
                        <th>진행상태</th>
                        <td>
                            <span :class="'status-badge ' + planDetail.progress_state">
                                {{ planDetail.progress_state }}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <th>지원목표</th>
                        <td colspan="3">{{ planDetail.plan_objective }}</td>
                    </tr>
                    <tr>
                        <th>계획내용</th>
                        <td colspan="3" class="content-text">{{ planDetail.plan_content }}</td>
                    </tr>
                    <tr>
                        <th>파일첨부</th>
                        <td colspan="3">
                            <div class="file_input_container">
                                <ul v-if="attachments.length > 0" class="file_list">
                                    <li v-for="file in attachments" :key="file.file_id" class="file_item clickable" @click="downloadFile(file)">
                                        <span class="file_icon">{{ getFileIcon(file.origin_name) }}</span>
                                        <span class="file_name">{{ file.origin_name }}</span>
                                    </li>
                                </ul>
                                <span v-else class="no-attachments">첨부된 파일이 없습니다.</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-else class="empty-msg">상세 정보가 존재하지 않습니다.</div>
    </div>
</template>

<style scoped>
.detail-container {
    background: #ffffff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 2px solid #f1f5f9;
    padding-bottom: 10px;
}

.btn-close {
    padding: 8px 16px;
    background-color: #ffab91;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1.2rem;
}

.btn-close:hover {
    background-color: #ff8a65; /* 더 진한 코랄색으로 변경 */
    transform: translateY(-1px); /* 살짝 위로 떠오름 */
    /* 버튼 색상과 맞춘 부드러운 그림자 추가 */
}

.detail-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 1.1rem;
}

.detail-table th {
    width: 120px;
    background-color: #fef9f6;
    padding: 12px;
    border: 1px solid #f4e2de;
    text-align: left;
    color: #475569;
}

.detail-table td {
    padding: 12px;
    border: 1px solid #f4e2de;
    color: #1e293b;
}

.content-text {
    height: 150px;
    vertical-align: top;
    white-space: pre-wrap; /* 줄바꿈 유지 */
}

.status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: bold;
}

/* 상태별 색상 예시 */
.status-badge.대기 {
    background: #fef3c7;
    color: #92400e;
}
.status-badge.승인 {
    background: #dcfce7;
    color: #166534;
}
.status-badge.반려 {
    background: #fee2e2;
    color: #991b1b;
}

.loading-msg,
.empty-msg {
    text-align: center;
    padding: 40px;
    color: #64748b;
}
</style>
