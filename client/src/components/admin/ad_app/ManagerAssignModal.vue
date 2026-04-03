<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { useSurveyStore } from '@/stores/useSurveyStore';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
    beneId: { type: [String, Number], required: true }
});

const emit = defineEmits(['close', 'success']);

const surveyStore = useSurveyStore();
const authStore = useAuthStore();

const selectedManagerId = ref('');
const managerList = ref([]);
const assignHistoryList = ref([]);
const beneName = ref('');
const currentManagerName = ref('');

const getResponseData = (response, fallbackValue = null) => {
    return response?.data?.success ? response.data.data : fallbackValue;
};

const fetchManagerList = async () => {
    try {
        const response = await axios.get('/api/abc/managers');
        managerList.value = getResponseData(response, []) || [];
    } catch (error) {
        console.error('담당자 목록 조회 실패:', error);
        managerList.value = [];
    }
};

const fetchAssignHistory = async () => {
    try {
        const response = await axios.get(`/api/abc/assign-manager/history/${props.beneId}`);
        assignHistoryList.value = getResponseData(response, []) || [];
    } catch (error) {
        console.error('담당자 배정 이력 조회 실패:', error);
        assignHistoryList.value = [];
    }
};

const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const handleConfirm = async () => {
    if (!selectedManagerId.value) {
        alert('담당자를 선택해 주세요.');
        return;
    }

    try {
        const response = await axios.put('/api/abc/assign-manager', {
            bene_id: props.beneId,
            manager_id: selectedManagerId.value,
            admin_id: authStore.userId
        });

        if (response.data?.success) {
            // 배정 요청에는 "누가 배정했는지"도 같이 보내야
            // manager_log에서 담당자 이름뿐 아니라 배정한 관리자까지 복구할 수 있다.
            alert('담당자 배정이 완료되었습니다.');
            emit('success');
        }
    } catch (error) {
        console.error('담당자 배정 실패:', error);
        alert('서버 통신 중 오류가 발생했습니다.');
    }
};

onMounted(async () => {
    // 모달은 대상자 선택이 끝난 뒤 열리므로
    // 이미 store에 있는 상세 정보로 제목과 현재 담당자를 바로 표시할 수 있다.
    beneName.value = surveyStore.selected_bene_detail?.bene_name || '지원대상자';
    currentManagerName.value = surveyStore.selected_bene_detail?.manager_name || null;

    await Promise.all([fetchManagerList(), fetchAssignHistory()]);
});
</script>

<template>
    <div class="assign-view-container">
        <h2>담당자 배정</h2>
        <hr class="divider" />

        <div class="assign-card">
            <div class="card-header">
                <template v-if="currentManagerName">
                    <p class="title-text">
                        <span>현재 담당자는</span>
                        <span class="highlight">{{ currentManagerName }}</span>
                        <span>입니다.</span>
                        <br />
                        <span>
                            <b>{{ beneName }}</b>
                            의 담당자를 변경하시겠습니까?
                        </span>
                    </p>
                </template>

                <template v-else>
                    <p class="title-text">
                        <span>
                            <b>{{ beneName }}</b>
                            에게
                        </span>
                        <br />
                        <span>담당자를 지정해 주세요.</span>
                    </p>
                </template>
            </div>

            <select v-model="selectedManagerId" class="manager-select">
                <option value="" disabled>담당자 선택</option>
                <option v-for="manager in managerList" :key="manager.user_id" :value="manager.user_id">
                    {{ manager.user_name }}
                </option>
            </select>

            <div class="btn-group">
                <button class="btn-confirm" @click="handleConfirm">확인</button>
                <button class="btn-cancel" @click="emit('close')">취소</button>
            </div>
        </div>

        <div class="history-card">
            <h3>담당자 배정 이력</h3>

            <div v-if="assignHistoryList.length === 0" class="empty-history">아직 배정 이력이 없습니다.</div>

            <div v-else class="timeline">
                <div v-for="history in assignHistoryList" :key="history.manager_log_id" class="timeline-item">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                        <span class="timeline-date">{{ formatDate(history.assign_date) }}</span>
                        <p class="timeline-main">
                            담당자
                            <strong>{{ history.manager_name || history.manager_id }}</strong>
                        </p>
                        <p class="timeline-sub">
                            배정 관리자:
                            {{ history.admin_name || history.admin_id || '정보 없음' }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.assign-view-container {
    max-width: 700px;
    margin: 0 auto;
    padding: 30px;
    background-color: #fef9f6;
}

h2 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 8px;
}

.divider {
    border: none;
    border-top: 2px solid #f4e2de;
    margin-bottom: 40px;
}

.assign-card,
.history-card {
    background-color: #fff;
    border: 2px solid #f4e2de;
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.assign-card {
    text-align: center;
    margin-bottom: 24px;
}

.history-card h3 {
    margin-top: 0;
    margin-bottom: 20px;
    font-weight: 700;
    color: #ffab91;
    border-bottom: 2px solid #f4e2de;
    padding-bottom: 10px;
}

.card-header {
    margin-bottom: 30px;
}

.title-text {
    font-size: 1.1rem;
    color: #1e293b;
    line-height: 1.6;
    margin: 0;
}

.title-text b {
    font-size: 1.25rem;
}

.highlight {
    color: #ffab91;
    font-weight: 800;
}

.manager-select {
    width: 80%;
    max-width: 300px;
    height: 45px;
    padding: 0 15px;
    font-size: 1rem;
    font-weight: 600;
    color: #334155;
    border: 2px solid #f4e2de;
    border-radius: 8px;
    outline: none;
    margin-bottom: 40px;
    background-color: #fff;
    cursor: pointer;
}

.manager-select:focus {
    border-color: #ffab91;
    box-shadow: 0 0 0 2px rgba(255, 171, 145, 0.2);
}

.btn-group {
    display: flex;
    justify-content: center;
    gap: 15px;
}

.btn-group button {
    padding: 10px 30px;
    font-size: 1rem;
    font-weight: 700;
    border-radius: 25px;
    cursor: pointer;
    transition: 0.2s;
}

.btn-confirm {
    background-color: #ffab91;
    color: #ffffff;
    border: none;
    box-shadow: 0 2px 4px rgba(255, 171, 145, 0.3);
}

.btn-confirm:hover {
    background-color: #ff8a65;
}

.btn-cancel {
    background-color: #ffffff;
    color: #ffab91;
    border: 2px solid #f4e2de;
}

.btn-cancel:hover {
    background-color: #fef9f6;
    color: #ff8a65;
    border-color: #ff8a65;
}

.empty-history {
    color: #94a3b8;
    text-align: center;
    padding: 16px 0;
    font-weight: 500;
}

.timeline {
    display: flex;
    flex-direction: column;
    gap: 18px;
    position: relative;
    padding-left: 18px;
    max-height: 260px;
    overflow-y: auto;
    padding-right: 8px;
}

.timeline::before {
    content: '';
    position: absolute;
    left: 4px;
    top: 4px;
    bottom: 4px;
    width: 2px;
    background-color: #f4e2de;
}

.timeline::-webkit-scrollbar {
    width: 8px;
}

.timeline::-webkit-scrollbar-thumb {
    background-color: #f4e2de;
    border-radius: 999px;
}

.timeline-item {
    position: relative;
    padding-left: 18px;
}

.timeline-marker {
    position: absolute;
    left: -2px;
    top: 4px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #ffab91;
}

.timeline-date {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #ffab91;
    margin-bottom: 4px;
}

.timeline-main,
.timeline-sub {
    margin: 0;
    color: #334155;
    line-height: 1.5;
}

.timeline-main {
    font-weight: 600;
}

.timeline-main strong {
    color: #1e293b;
    font-weight: 800;
}

.timeline-sub {
    margin-top: 4px;
    font-size: 0.95rem;
    color: #94a3b8;
}
</style>
