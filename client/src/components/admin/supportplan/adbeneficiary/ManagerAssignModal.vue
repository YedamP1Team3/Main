<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useSurveyStore } from '@/stores/useSurveyStore';

const props = defineProps({
    beneId: { type: [String, Number], required: true }
});

// 부모(Main.vue)에게 창 닫기/성공 이벤트를 보냄
const emit = defineEmits(['close', 'success']);
const surveyStore = useSurveyStore();

const selectedManagerId = ref('');
const managerList = ref([]);
const beneName = ref('');
const currentManagerName = ref('');

// 매니저 목록 불러오기
const fetchManagerList = async () => {
    try {
        const res = await axios.get('http://localhost:3000/abc/managers');
        managerList.value = res.data.data || [];
    } catch (error) {
        console.error('담당자 목록 로드 실패:', error);
    }
};

// 배정 확인
const handleConfirm = async () => {
    if (!selectedManagerId.value) {
        alert('담당자를 선택해 주세요.');
        return;
    }
    try {
        const payload = {
            bene_id: props.beneId,
            manager_id: selectedManagerId.value
        };
        const res = await axios.put(`http://localhost:3000/abc/assign-manager`, payload);

        if (res.data.success || res.status === 200) {
            alert('담당자 배정이 완료되었습니다.');
            emit('success'); // Main 화면으로 성공 이벤트 전달
        }
    } catch (error) {
        console.error('담당자 배정 에러:', error);
        alert('서버 통신 중 오류가 발생했습니다.');
    }
};

onMounted(() => {
    fetchManagerList();
    beneName.value = surveyStore.selected_bene_detail?.bene_name || '대상자';
    currentManagerName.value = surveyStore.selected_bene_detail?.manager_name || null;
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
                        현재 담당자는 <span class="highlight">{{ currentManagerName }}</span> 입니다.<br />
                        <b>{{ beneName }}</b> 님의 담당자를 변경하시겠습니까?
                    </p>
                </template>
                <template v-else>
                    <p class="title-text">
                        <b>{{ beneName }}</b> 님의<br />
                        담당자를 지정해 주세요.
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
    </div>
</template>

<style scoped>
.assign-view-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 30px;
}

h2 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 8px;
}

.divider {
    border: none;
    border-top: 2px solid #334155;
    margin-bottom: 40px;
}

.assign-card {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 40px;
    text-align: center;
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
    color: #3b82f6;
    font-weight: 700;
}

.manager-select {
    width: 80%;
    max-width: 300px;
    height: 45px;
    padding: 0 15px;
    font-size: 1rem;
    color: #334155;
    border: 1px solid #94a3b8;
    border-radius: 8px;
    outline: none;
    margin-bottom: 40px;
}
.manager-select:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.btn-group {
    display: flex;
    justify-content: center;
    gap: 15px;
}
.btn-group button {
    padding: 10px 30px;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 30px;
    cursor: pointer;
    transition: 0.2s;
}

.btn-confirm {
    background-color: #1e293b;
    color: #ffffff;
    border: none;
}
.btn-confirm:hover {
    background-color: #0f172a;
}
.btn-cancel {
    background-color: #ffffff;
    color: #64748b;
    border: 1px solid #cbd5e1;
}
.btn-cancel:hover {
    background-color: #f1f5f9;
    color: #475569;
}
</style>
