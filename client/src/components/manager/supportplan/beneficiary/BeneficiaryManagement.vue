<script setup>
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSurveyStore, PRIORITY_MAP } from '@/stores/useSurveyStore'; // 💡 스토어 연결
import TabPlan from './TabPlan.vue';
import resultPlan from './resultPlan.vue';

const props = defineProps({
    beneId: { type: [String, Number] }
});

// 💡 상세 조회를 위한 'select-app' 이벤트 추가
const emit = defineEmits(['newaddplan', 'select-plan', 'select-result', 'select-app', 'newresultplan']);
const currentTab = ref('plan'); // 기본 탭을 지원신청서로 변경해도 좋습니다.
const tabPlanRef = ref(null);

const isListVisible = ref(true);
const selectedResultId = ref(null);

const surveyStore = useSurveyStore();
const { application_list } = storeToRefs(surveyStore);

const handleSelectPlan = (planId) => {
    emit('select-plan', planId);
};

const handleResultIdDetail = (resultId) => {
    selectedResultId.value = resultId;
    emit('select-result', resultId);
};
// 💡 리스트 클릭 시 실행 (스토어에 상세정보 세팅 후 뷰 모드 변경 알림)
const viewApplicationDetail = async (appId) => {
    await surveyStore.loadApplicationView(appId);
    emit('select-app', appId);
};

// 💡 한글 번역
const formatPriority = (item) => {
    if (item.progress_status === 'pending') return '대기';
    if (!item.priority_status) return '미신청';
    const lowerCode = String(item.priority_status).toLowerCase();
    return PRIORITY_MAP[lowerCode] || item.priority_status;
};

watch(currentTab, () => {
    isListVisible.value = true;
    selectedResultId.value = null;
});

defineExpose({
    refreshTabPlan: () => {
        if (tabPlanRef.value) tabPlanRef.value.fetchPlanList(props.beneId);
    }
});
</script>

<template>
    <div class="management-container">
        <nav class="tab-menu">
            <button :class="{ active: currentTab === 'Application' }" @click="currentTab = 'Application'">지원신청서</button>
            <button :class="{ active: currentTab === 'Plan' }" @click="currentTab = 'Plan'">지원계획서</button>
            <button :class="{ active: currentTab === 'Result' }" @click="currentTab = 'Result'">지원결과서</button>
            <button :class="{ active: currentTab === 'Consult' }" @click="currentTab = 'Consult'">상담내역</button>
        </nav>

        <div class="tab-content">
            <div v-if="currentTab === 'Application'">
                <div class="content-header">
                    <h3>지원 신청서</h3>
                </div>
                <table class="list-table">
                    <thead>
                        <tr>
                            <th>작성자</th>
                            <th>지원자</th>
                            <th>대기단계</th>
                            <th>작성일자</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="application_list.length === 0">
                            <td colspan="4" class="empty-msg">
                                {{ beneId ? '등록된 신청서가 없습니다.' : '지원자를 먼저 선택해주세요.' }}
                            </td>
                        </tr>
                        <tr v-else v-for="item in application_list" :key="item.id" class="clickable-row" @click="viewApplicationDetail(item.id)">
                            <td>{{ item.writer }}</td>
                            <td>{{ item.bene_name }}</td>
                            <td>{{ formatPriority(item) }}</td>
                            <td>{{ item.date }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <TabPlan v-if="currentTab === 'Plan'" ref="tabPlanRef" :beneId="beneId" @Newaddplan="emit('newaddplan')" @select-plan="handleSelectPlan" />
            <resultPlan v-if="currentTab === 'Result'" ref="tabPlanRef" :beneId="beneId" @newresultplan="emit('newresultplan')" @select-result="handleResultIdDetail" />
        </div>
        <div v-if="selectedResultId" :class="{ 'full-content': !isListVisible }" class="detail-side">
            <resultPlanDetail
                :resultId="selectedResultId"
                :beneId="beneId"
                @toggle-list="(val) => (isListVisible = val)"
                @refresh="
                    selectedResultId = null;
                    isListVisible = true;
                "
            />
        </div>
    </div>
</template>

<style scoped>
/* 1. 전체를 감싸는 흰색 카드 컨테이너 */
.management-container {
    background-color: #ffffff; /* 🟢 요청하신 흰색 배경 */
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 0; /* 내부에서 여백 조절 */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    overflow: hidden; /* 테두리 밖으로 내용 안 나가게 */
}

/* 2. 탭 메뉴 스타일 */
.tab-menu {
    display: flex;
    background-color: #ffffff;
    border-bottom: 1px solid #f1f5f9;
    padding: 0 10px;
}

.tab-menu button {
    background: none;
    border: none;
    padding: 15px 20px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #94a3b8;
    cursor: pointer;
    position: relative;
    transition: all 0.2s;
}

/* 활성화된 탭 포인트 */
.tab-menu button.active {
    color: #3b82f6;
}

.tab-menu button.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #3b82f6; /* 탭 하단 파란색 선 */
}

/* 3. 하단 컨텐츠 영역 패딩 */
.tab-content {
    padding: 20px;
    min-height: 400px; /* 목록이 없을 때도 일정 높이 유지 */
}

.content-header {
    margin-bottom: 20px;
}
.content-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #1e293b;
}
.list-table {
    width: 100%;
    border-collapse: collapse;
    text-align: center;
    font-size: 0.9rem;
}
.list-table th {
    padding: 10px;
    font-weight: 600;
    color: #64748b;
    border-top: 1px solid #cbd5e1;
    border-bottom: 1px solid #cbd5e1;
}
.list-table td {
    padding: 12px 10px;
    color: #334155;
    border-bottom: 1px solid #e2e8f0;
}
.empty-msg {
    padding: 30px !important;
    color: #94a3b8 !important;
}
.clickable-row {
    cursor: pointer;
    transition: background-color 0.2s;
}
.clickable-row:hover {
    background-color: #f8fafc;
}
/* 기존 .management-container 등 스타일 유지 */
</style>
