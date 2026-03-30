<script setup>
import { ref } from 'vue';
import { useSurveyStore } from '@/stores/useSurveyStore';

import BeneficiaryInfo from '@/components/member/m_application/m_BeneficiaryInfo.vue';
import BeneficiaryManagement from '@/components/member/m_application/MemberManagement.vue';
import SurveyApplicationForm from '@/components/member/m_application/MemberSurvey.vue';
import MemberSupportDetail from '@/components/member/m_application/MemberSupportDetail.vue';
import MemberResultDetail from '@/components/member/m_application/MemberResultDetail .vue';

const surveyStore = useSurveyStore();
const viewMode = ref('empty');
const selectPlan = ref(null);
const selectResult = ref(null);

const handleTabChange = (tabName) => {
    viewMode.value = 'empty';
    surveyStore.is_survey_visible = false;
};

const handleIdDetail = (planId) => {
    selectPlan.value = planId;
    viewMode.value = 'plan';
};

const handleIdResult = (resultId) => {
    selectResult.value = resultId;
    viewMode.value = 'result';
};
</script>

<template>
    <header class="main-header"></header>

    <div class="dashboard-container">
        <aside class="side-panel">
            <section class="info-section">
                <!-- 수정됨: 불필요한 이벤트 리스너 제거 -->
                <BeneficiaryInfo />
            </section>

            <section class="list-section">
                <BeneficiaryManagement @change-tab="handleTabChange" @select-plan="handleIdDetail" @select-result="handleIdResult" />
            </section>
        </aside>

        <main class="main-content">
            <div v-if="viewMode === 'plan'" class="editor-container">
                <MemberSupportDetail :planId="selectPlan" />
            </div>
            <div v-else-if="viewMode === 'survey' || surveyStore.is_survey_visible" class="editor-container">
                <SurveyApplicationForm />
            </div>
            <div v-else-if="viewMode === 'result'" class="editor-container">
                <MemberResultDetail :resultId="selectResult" />
            </div>
            <!-- 수정됨: priority 관련 화면 렌더링 삭제 -->
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
/* 1. 헤더 스타일 */
.main-header {
    width: 100%;
    height: 64px;
    background-color: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 100;
}

/* 2. 대시보드 전체 컨테이너 */
.dashboard-container {
    display: flex;
    width: 100%;
    height: calc(100vh - 64px);
    background-color: #ffffff;
    overflow: hidden;
}

/* 🟢 왼쪽 사이드 패널 (600px 고정, 내부 스크롤) */
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

/* 🔵 오른쪽 메인 콘텐츠 영역 */
.main-content {
    flex: 1;
    background-color: #ffffff;
    padding: 40px;
    overflow-y: auto;
    display: flex;
    flex-direction: column; /* 중앙 정렬을 위해 추가 */
}

/* 작성창 컨테이너 (2번째 파일 스타일 차용) */
.editor-container {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
}

/* 빈 화면 가이드 스타일 (2번째 파일 스타일 차용) */
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
