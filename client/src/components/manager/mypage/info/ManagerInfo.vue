<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// props: true 설정으로 라우터에서 :id를 받습니다.
const props = defineProps({
    id: String
});

const router = useRouter();

// 로딩 상태 관리 (선택)
const isLoading = ref(true);

// [2번] 기본 정보 데이터 (readonly)
const managerData = ref({
    name: '',
    userId: '',
    email: '',
    institution: '',
    joinDate: '',
    phone: ''
});

// [4번] 업무 현황 데이터 (상담일지, 지원계획서, 지원결과서 포함)
const taskStats = ref([]);

// API 데이터 호출 함수
const fetchMyPageData = async () => {
    try {
        isLoading.value = true;
        // app.js에 등록한 경로로 요청
        const response = await axios.get(`/api/mgmypage/${props.id}`);

        if (response.data) {
            // 서비스에서 보낸 { profile, taskStats } 구조에 맞게 할당
            managerData.value = response.data.profile;
            taskStats.value = response.data.taskStats;
        }
    } catch (error) {
        console.error('마이페이지 데이터 로드 실패:', error);
        alert('데이터를 불러오는 중 오류 발생');
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    if (props.id) {
        fetchMyPageData();
    } else {
        console.error('담당자 ID가 없습니다.');
    }
});

const goToEditPage = () => {
    router.push({ name: 'managerInfoedit', params: { id: props.id } });
};
</script>

<template>
    <div class="member-info-wrapper">
        <section class="card mb-6">
            <div class="section-header">
                <h2 class="text-2xl font-bold m-0 text-900">기본 정보 확인</h2>
                <button class="p-button p-button-outlined p-button-sm" @click="goToEditPage">수정하기</button>
            </div>

            <div class="info-grid-container flex flex-wrap gap-4 mt-4">
                <div class="info-item">
                    <label class="font-semibold text-sm text-600 block mb-2">이름</label>
                    <div class="p-inputtext surface-100 border-none">{{ managerData.name }}</div>
                </div>
                <div class="info-item">
                    <label class="font-semibold text-sm text-600 block mb-2">아이디</label>
                    <div class="p-inputtext surface-100 border-none">{{ managerData.userId }}</div>
                </div>
                <div class="info-item">
                    <label class="font-semibold text-sm text-600 block mb-2">이메일</label>
                    <div class="p-inputtext surface-100 border-none">{{ managerData.email }}</div>
                </div>
                <div class="info-item">
                    <label class="font-semibold text-sm text-600 block mb-2">소속기관</label>
                    <div class="p-inputtext surface-100 border-none">{{ managerData.institution }}</div>
                </div>
                <div class="info-item">
                    <label class="font-semibold text-sm text-600 block mb-2">가입날짜</label>
                    <div class="p-inputtext surface-100 border-none">{{ managerData.joinDate }}</div>
                </div>
                <div class="info-item">
                    <label class="font-semibold text-sm text-600 block mb-2">전화번호</label>
                    <div class="p-inputtext surface-100 border-none">{{ managerData.phone }}</div>
                </div>
            </div>
        </section>

        <section class="card mt-6">
            <div class="section-header">
                <h2 class="text-2xl font-bold m-0 text-900">나의 업무 현황 <span class="text-sm font-normal text-500 ml-2">최근 30일</span></h2>
            </div>

            <div class="task-grid-container mt-4">
                <div v-for="task in taskStats" :key="task.title" class="task-card shadow-1">
                    <div class="task-title">{{ task.title }}</div>

                    <div class="task-stats">
                        <div v-for="s in task.stats" :key="s.label" class="stat-row">
                            <span>{{ s.label }}</span> <strong>{{ s.value }}</strong>
                        </div>
                    </div>

                    <div class="task-chart-bar">
                        <div v-for="color in task.colors" :key="color" :class="['bar', color]" style="flex: 1"></div>
                    </div>

                    <div class="total-count">총 {{ task.total }}건</div>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
.member-info-wrapper {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.member-info-wrapper .card {
    background: white !important;
    border-radius: 16px !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05) !important;
    padding: 2rem !important;
    border: 2px solid #f4e2de !important;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 2px solid #f4e2de;
    margin-bottom: 1.5rem;
}

.p-button.p-button-outlined.p-button-sm {
    background-color: #ffab91 !important;
    border: none !important;
    color: white !important;
    padding: 10px 1.5rem !important;
    border-radius: 8px !important;
    font-weight: 600;
}

.p-button.p-button-outlined.p-button-sm:hover {
    background-color: #ff8a65 !important;
}

.info-item {
    flex: 1 1 calc(33.33% - 2rem);
    min-width: 280px;
}

.p-inputtext {
    padding: 0.85rem;
    border-radius: 8px;
    background-color: #f8fafc !important;
    height: 48px;
    display: flex;
    align-items: center;
}

/* 업무 현황 그리드: 4개 항목을 한 줄에 배치 */
.task-grid-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
}

.task-card {
    background: white;
    border: 1px solid #f1f5f9;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
}

.task-title {
    font-size: 1.25rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #f1f5f9;
}

.task-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem 1rem;
    margin-bottom: 1.5rem;
    min-height: 50px; /* 카드 높이 균형 유지 */
}

.stat-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
}

.stat-row span {
    color: #64748b;
}

.task-chart-bar {
    display: flex;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    gap: 2px;
    margin-bottom: 0.5rem;
}

.bar.red {
    background-color: #ef4444;
}
.bar.yellow {
    background-color: #f59e0b;
}
.bar.green {
    background-color: #10b981;
}
.bar.blue {
    background-color: #3b82f6;
}

.total-count {
    font-size: 0.75rem;
    color: #94a3b8;
    text-align: right;
}

.p-button-sm {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    cursor: pointer;
}
</style>
