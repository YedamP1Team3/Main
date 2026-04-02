<script setup>
import { ref } from 'vue';
import { useSurveyStore } from '@/stores/useSurveyStore'; // 💡 스토어 연결 (동기화 용도)

import JsTopbarmg from '@/layout/manger/JsTopbarmg.vue';
import BeneficiaryInfo from '@/components/manager/supportplan/beneficiary/BeneficiaryInfo.vue';
import BeneficiaryManagement from '@/components/manager/BeneficiaryManagement.vue';
import BeneficiaryNewPlan from '@/components/manager/supportplan/beneficiary/BeneficiaryNewPlan.vue';
import BeneficiaryDetail from '@/components/manager/supportplan/beneficiary/BeneficiaryDetail.vue';
import ResultNewPlan from '@/components/manager/supportplan/beneficiary/resultNewPlan.vue';
// 💡 신청서 상세조회 뷰 임포트
import ManagerSurveyView from '@/components/manager/supportplan/beneficiary/ManagerSurveyView.vue';
// 💡 [추가] 대기단계 스위치 컴포넌트 임포트 (경로 확인 필요)
import ManagerPrioritySwitch from '@/components/manager/supportplan/beneficiary/ManagerPrioritySwitch.vue';
import resultPlanDetail from '@/components/manager/supportplan/beneficiary/resultPlanDetail.vue';
import BeneficiaryTempDetail from '@/components/manager/supportplan/beneficiary/BeneficiaryTempDetail.vue';
import resultTempDetail from '@/components/manager/supportplan/beneficiary/resultTempDetail.vue';

const selectedId = ref('');
const selectedPriorityId = ref(null);
const viewMode = ref('empty');
const managementRef = ref(null);
const selectPlan = ref(null);
const selectResultId = ref(null);
const selectedProgressStatus = ref('');

const surveyStore = useSurveyStore(); // 💡 스토어 초기화

const handleIdUpdate = async (id, priorityId, progressStatus) => {
    selectedId.value = id;
    selectedPriorityId.value = priorityId;
    selectedProgressStatus.value = progressStatus;
    viewMode.value = 'empty';
    surveyStore.is_survey_visible = false;

    // 💡 대상자 선택 시 스토어 강제 동기화 (오류 방지)
    if (id) {
        await surveyStore.selectBeneficiary(id);
    }
};

const handleIdDetail = (data) => {
    // data가 객체 { planId, isTemp } 형태면 ID만 추출, 아니면 data 자체를 ID로 사용
    const id = data && typeof data === 'object' ? data.planId : data;
    const isTemp = data && typeof data === 'object' ? data.isTemp : false;

    selectPlan.value = id;
    viewMode.value = isTemp ? 'tempDetail' : 'detail';
};

const handleResultIdDetail = (data) => {
    const id = data && typeof data === 'object' ? data.resultId : data;
    const isTemp = data && typeof data === 'object' ? data.isTemp : false;

    selectResultId.value = id;
    viewMode.value = isTemp ? 'resultTempDetail' : 'resultDetail';
};

// 💡 탭에서 신청서를 클릭했을 때 뷰 모드를 변경하는 함수
const handleAppDetail = (appId) => {
    viewMode.value = 'app_detail';
};

// 💡 [추가] 대기단계 모달 열기 로직
const handleOpenPriority = async () => {
    if (!selectedId.value) {
        alert('지원자를 먼저 선택해주세요.');
        return;
    }
    // 창을 열기 전, 최신 Priority 상태를 Store에 로드
    await surveyStore.fetchPriorityInfo(selectedId.value);
    viewMode.value = 'priority';
};

const reloadList = () => {
    if (managementRef.value) {
        managementRef.value.refreshTabPlan();
    }
    viewMode.value = 'empty';
};

const handleSelectSubPlan = (planId) => {
    if (!managementRef.value) return;
    if (typeof managementRef.value.openSubPlan === 'function') {
        managementRef.value.openSubPlan(planId);
    }
};

const handleNewPlanOpen = (priorityIdFromChild) => {
    // 만약 자식(Management)이 특정 ID를 던져준다면 그것을 쓰고,
    // 없다면 부모가 이미 선택해서 들고 있는 값을 유지합니다.
    if (priorityIdFromChild) {
        selectedPriorityId.value = priorityIdFromChild;
    }

    viewMode.value = 'create';
};
</script>

<template>
    <header class="main-header">
        <JsTopbarmg />
    </header>

    <div class="dashboard-container">
        <aside class="side-panel">
            <section class="info-section">
                <!-- 💡 [수정] open-priority 이벤트 수신 대기 -->
                <BeneficiaryInfo @updateBeneId="handleIdUpdate" @open-priority="handleOpenPriority" />
            </section>

            <section class="list-section">
                <BeneficiaryManagement
                    ref="managementRef"
                    :beneId="selectedId"
                    :priorityId="selectedPriorityId"
                    :progressStatus="selectedProgressStatus"
                    @select-plan="handleIdDetail"
                    @select-result="handleResultIdDetail"
                    @select-app="handleAppDetail"
                    @newaddplan="handleNewPlanOpen"
                    @newresultplan="viewMode = 'resultCreate'"
                />
            </section>
        </aside>

        <main class="main-content">
            <div v-if="viewMode === 'create'" class="editor-container">
                <BeneficiaryNewPlan :beneId="selectedId" :priorityId="selectedPriorityId" @cancel="viewMode = 'empty'" @refresh="reloadList" />
            </div>
            <div v-else-if="viewMode === 'detail'" class="editor-container">
                <BeneficiaryDetail :planId="selectPlan" :beneId="selectedId" :priorityId="selectedPriorityId" @cancel="viewMode = 'empty'" @refresh="reloadList" />
            </div>

            <div v-else-if="viewMode === 'tempDetail'" class="editor-container">
                <BeneficiaryTempDetail :planId="selectPlan" :beneId="selectedId" :priorityId="selectedPriorityId" @cancel="viewMode = 'empty'" @refresh="reloadList" />
            </div>
            <div v-else-if="viewMode === 'resultCreate'" class="editor-container">
                <ResultNewPlan :beneId="selectedId" :priorityId="selectedPriorityId" @cancel="viewMode = 'empty'" @refresh="reloadList" />
            </div>
            <div v-else-if="viewMode === 'app_detail'" class="editor-container">
                <ManagerSurveyView @close="viewMode = 'empty'" />
            </div>
            <div v-else-if="viewMode === 'resultDetail'" class="editor-container">
                <resultPlanDetail :resultId="selectResultId" :beneId="selectedId" @cancel="viewMode = 'empty'" @refresh="reloadList" @select-sub-plan="handleSelectSubPlan" />
            </div>
            <div v-else-if="viewMode === 'resultTempDetail'" class="editor-container">
                <resultTempDetail :resultId="selectResultId" :beneId="selectedId" @cancel="viewMode = 'empty'" @refresh="reloadList" @select-sub-plan="handleSelectSubPlan" />
            </div>
            <!-- 💡 [추가] Manager 대기단계 설정 화면 -->
            <div v-else-if="viewMode === 'priority'" class="editor-container" style="height: 100%">
                <ManagerPrioritySwitch @close="viewMode = 'empty'" />
            </div>

            <div v-else class="empty-state">
                <div class="guide-box">
                    <i class="pi pi-file"></i>
                    <p>좌측 목록에서 항목을 선택해주세요.</p>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
/* 전체 화면 컨테이너 */
.dashboard-container {
    display: flex;
    width: 100%;
    height: 100vh;
    background-color: #ffffff; /* 전체는 흰색 바탕 */
    overflow: hidden;
}

/* 🟢 왼쪽 사이드 패널 (500px) */
.side-panel {
    flex: 0 0 600px;
    background-color: #f8fafc; /* 살짝 회색빛을 주어 영역 분리 */
    border-right: 1px solid #e2e8f0; /* 중간 세로 구분선 */
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 20px;
    overflow-y: auto; /* 내용 많을 때 스크롤 */
}

/* 각 섹션(정보, 목록) 스타일 */
.info-section,
.list-section {
    width: 100%;
}

/* 🔵 오른쪽 메인 콘텐츠 영역 */
.main-content {
    flex: 1;
    background-color: #ffffff;
    padding: 40px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

/* 작성창 컨테이너 */
.editor-container {
    width: 100%;
    max-width: 900px; /* 너무 넓어지지 않게 가이드라인 설정 */
    margin: 0 auto; /* 중앙 정렬 */
}

/* 빈 화면 가이드 스타일 */
.empty-state {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #94a3b8;
}

.guide-box {
    text-align: center;
    border: 2px dashed #e2e8f0;
    padding: 50px;
    border-radius: 16px;
}

.guide-box i {
    font-size: 2rem;
    margin-bottom: 1rem;
}
.main-header {
    width: 100%;
    height: 64px; /* 헤더 높이 명시 (원하는 대로 조절 가능) */
    background-color: #ffffff;
    border-bottom: 1px solid #e2e8f0; /* 헤더와 본문 구분선 */
    position: sticky; /* 상단 고정 */
    top: 0;
    z-index: 100;
}

/* 2. 대시보드 컨테이너 수정 */
.dashboard-container {
    display: flex;
    width: 100%;
    /* 전체 화면(100vh)에서 헤더 높이(64px)만큼 뺍니다 */
    height: calc(100vh - 64px);
    background-color: #ffffff;
    overflow: hidden;
}
</style>
