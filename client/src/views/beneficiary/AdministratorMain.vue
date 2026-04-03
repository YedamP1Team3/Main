<script setup>
import { ref } from 'vue';
import { useSurveyStore } from '@/stores/useSurveyStore';
import JsTopbarad from '@/layout/admin/JsTopbarad.vue';
import AdSupportInfo from '@/components/admin/AdSupportInfo.vue';
import AdminManagement from '@/components/admin/AdminManagement.vue';
import AdplanDetail from '@/components/admin/supportplan/adbeneficiary/AdplanDetail.vue';
import adResultPlanDetail from '@/components/admin/supportplan/adbeneficiary/AdresultPlanDetail.vue';
import adminsurvey from '@/components/admin/ad_app/AdminSurveyView.vue';
import ManagerAssignView from '@/components/admin/ad_app/ManagerAssignModal.vue';
// ⭐️ 새로 만든 관리자용 승인/반려 컴포넌트 임포트 (경로는 실제에 맞게 수정해주세요)
import AdminPriorityManage from '@/components/admin/ad_app/AdminPriorityManage.vue';

const selectedId = ref('');
const selectedPriorityId = ref(null);
const viewMode = ref('empty');
const managementRef = ref(null);
const selectPlan = ref(null);
const surveyStore = useSurveyStore(); // ⭐️ 스토어 인스턴스
const selectResult = ref(null);

//지원자를 새로 선택했을때
const handleIdUpdate = async (id, priorityId) => {
    selectedId.value = id;
    selectedPriorityId.value = priorityId;
    viewMode.value = 'empty';
    surveyStore.is_survey_visible = false;

    // ⭐️ [핵심 수정] 관리자 화면에서도 지원자 선택 시 스토어 데이터를 강제 동기화해야 합니다!
    // 이 코드가 없어서 클릭해야만 값이 바뀌는 버그가 발생했던 것입니다.
    if (id) {
        await surveyStore.selectBeneficiary(id);
    } else {
        surveyStore.clearStore();
    }
};

const handleIdDetail = (planId) => {
    selectPlan.value = planId;
    viewMode.value = 'plan_detail';
};

const handleAppDetail = (appId) => {
    viewMode.value = 'app_detail';
};

const handleResultDetail = (resultId) => {
    selectResult.value = resultId;
    viewMode.value = 'result_detail'; // 우측 화면 전환
};

// ⭐️ 2. 배정 화면 열기 함수
const handleAssignManager = () => {
    viewMode.value = 'assign_manager';
};

const handleAssignSuccess = async () => {
    alert('담당자 배정이 성공적으로 반영되었습니다.');
    viewMode.value = 'empty';
};

const reloadList = () => {
    if (managementRef.value) {
        managementRef.value.refreshTabPlan();
    }
    viewMode.value = 'empty';
};

// ⭐️ 대기단계 입력창 클릭 시 호출되는 함수 추가
const handleOpenPriority = async () => {
    if (!selectedId.value) {
        alert('지원자를 먼저 선택해주세요.');
        return;
    }
    // 최신 대기단계 정보를 스토어에 업데이트 후 뷰 모드 전환
    await surveyStore.fetchPriorityInfo(selectedId.value);
    viewMode.value = 'priority';
};

const handleSelectSubPlan = (planId) => {
    if (!managementRef.value) return;
    if (typeof managementRef.value.openSubPlan === 'function') {
        managementRef.value.openSubPlan(planId);
    }
};
</script>

<template>
    <header class="main-header">
        <JsTopbarad />
    </header>

    <div class="dashboard-container">
        <aside class="side-panel">
            <section class="info-section">
                <AdSupportInfo @updateBeneId="handleIdUpdate" @open-priority="handleOpenPriority" />
            </section>

            <section class="list-section">
                <AdminManagement ref="managementRef" :beneId="selectedId" @select-result="handleResultDetail" @select-plan="handleIdDetail" @select-app="handleAppDetail" @assign-manager="handleAssignManager" @newaddplan="viewMode = 'create'" />
            </section>
        </aside>

        <main class="main-content">
            <div v-if="viewMode === 'plan_detail'" class="editor-container">
                <AdplanDetail :planId="selectPlan" :beneId="selectedId" :priorityId="selectedPriorityId" @cancel="viewMode = 'empty'" @refresh="reloadList" />
            </div>
            <div v-else-if="viewMode === 'app_detail'" class="editor-container">
                <adminsurvey @close="viewMode = 'empty'" />
            </div>

            <div v-else-if="viewMode === 'assign_manager'" class="editor-container">
                <ManagerAssignView :beneId="selectedId" @close="viewMode = 'empty'" @success="handleAssignSuccess" />
            </div>
            <div v-else-if="viewMode === 'result_detail'" class="editor-container">
                <adResultPlanDetail :resultId="selectResult" :beneId="selectedId" @cancel="viewMode = 'empty'" @refresh="reloadList" @select-sub-plan="handleSelectSubPlan" />
            </div>

            <div v-else-if="viewMode === 'priority'" class="editor-container" style="height: 100%">
                <AdminPriorityManage @close="viewMode = 'empty'" @refresh="reloadList" />
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
    background-color: #fef9f6; /* 살짝 회색빛을 주어 영역 분리 */
    border-right: 2px solid #f4e2de; /* 중간 세로 구분선 */
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
    background-color: #fef9f6;
    padding: 40px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

/* 작성창 컨테이너 */
.editor-container {
    width: 100%;
    max-width: 1100px; /* 너무 넓어지지 않게 가이드라인 설정 */
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
