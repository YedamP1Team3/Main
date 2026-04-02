<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useSurveyStore } from '@/stores/useSurveyStore';

import BeneficiaryInfo from '@/components/member/m_BeneficiaryInfo.vue';
import BeneficiaryManagement from '@/components/member//MemberManagement.vue';
import SurveyApplicationForm from '@/components/member/m_application/MemberSurvey.vue';
import MemberSupportDetail from '@/components/member/m_plan_result/MemberSupportDetail.vue';
import MemberResultDetail from '@/components/member/m_plan_result/MemberResultDetail .vue';

const surveyStore = useSurveyStore();
const route = useRoute();

// 오른쪽 메인 영역은 사용자가 무엇을 클릭했는지에 따라 달라진다.
// 신청서 작성/조회, 계획서 상세, 결과서 상세 중 무엇을 보여줄지 이 값으로 제어한다.
const viewMode = ref('empty');
const selectedPlanId = ref(null);
const selectedResultId = ref(null);
const activeTab = ref('Application');

const resolveTabName = (tab) => {
    if (tab === 'Plan' || tab === 'Result' || tab === 'Consult') {
        return tab;
    }

    return 'Application';
};

const resetRightPanel = () => {
    viewMode.value = 'empty';
    surveyStore.is_survey_visible = false;
};

const handleTabChange = (tabName) => {
    activeTab.value = tabName;
    resetRightPanel();
};

const handleSelectPlan = (planId) => {
    selectedPlanId.value = planId;
    viewMode.value = 'plan';
};

const handleSelectResult = (resultId) => {
    selectedResultId.value = resultId;
    viewMode.value = 'result';
};

// HistoryTable이나 사이드바에서 beneId/tab query를 넘겨주면
// 이 화면은 그 값을 읽어서 "누가 선택되었는지"와 "어느 탭부터 열지"를 복원한다.
const applyRouteState = async () => {
    const beneId = route.query.beneId;
    activeTab.value = resolveTabName(route.query.tab);
    resetRightPanel();

    if (!beneId) {
        return;
    }

    if (surveyStore.my_beneficiaries.length === 0) {
        await surveyStore.fetchBeneficiaryList();
    }

    if (String(surveyStore.selected_bene_id || '') !== String(beneId)) {
        await surveyStore.selectBeneficiary(beneId);
    }
};

watch([() => route.query.beneId, () => route.query.tab], applyRouteState, {
    immediate: true
});
</script>

<template>
    <header class="main-header"></header>

    <div class="dashboard-container">
        <aside class="side-panel">
            <section class="info-section">
                <BeneficiaryInfo />
            </section>

            <section class="list-section">
                <BeneficiaryManagement :active-tab="activeTab" @change-tab="handleTabChange" @select-plan="handleSelectPlan" @select-result="handleSelectResult" />
            </section>
        </aside>

        <main class="main-content">
            <div v-if="viewMode === 'plan'" class="editor-container">
                <MemberSupportDetail :planId="selectedPlanId" />
            </div>

            <div v-else-if="viewMode === 'survey' || surveyStore.is_survey_visible" class="editor-container">
                <SurveyApplicationForm />
            </div>

            <div v-else-if="viewMode === 'result'" class="editor-container">
                <MemberResultDetail :resultId="selectedResultId" />
            </div>

            <div v-else class="empty-state">
                <div class="guide-box">
                    <i class="pi pi-file"></i>
                    <p>왼쪽 목록에서 항목을 선택해 주세요.</p>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
.main-header {
    width: 100%;
    height: 64px;
    background-color: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 100;
}

.dashboard-container {
    display: flex;
    width: 100%;
    height: calc(100vh - 64px);
    background-color: #ffffff;
    overflow: hidden;
}

.side-panel {
    flex: 0 0 600px;
    background-color: #f8fafc;
    border-right: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 20px;
    overflow-y: auto;
}

.info-section,
.list-section {
    width: 100%;
}

.main-content {
    flex: 1;
    background-color: #ffffff;
    padding: 40px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.editor-container {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
}

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
</style>
