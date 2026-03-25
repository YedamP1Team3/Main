<script setup>
import { ref } from 'vue';
import { useSurveyStore } from '@/stores/useSurveyStore';

// 자식 컴포넌트 임포트
import BeneficiaryInfo from '@/components/member/m_application/m_BeneficiaryInfo.vue';
import BeneficiaryManagement from '@/components/member/m_application/MemberManagement.vue';
import SurveyApplicationForm from '@/components/member/m_application/MemberSurvey.vue';
import MemberSupportDetail from '@/components/member/m_application/MemberSupportDetail.vue';

const surveyStore = useSurveyStore();

// ⭐️ 우측 화면 전환 모드 (기본: 빈 화면)
const viewMode = ref('empty');

// ⭐️ 에러의 원인! 상세 보기할 계획서의 ID를 담을 변수 선언 (반드시 필요함)
const selectPlan = ref(null);

// 1. 탭을 변경했을 때 (지원신청서 <-> 지원계획서)
const handleTabChange = (tabName) => {
    // 탭만 바꿨을 때는 우측 화면을 무조건 빈 화면으로 초기화
    viewMode.value = 'empty';
    surveyStore.is_survey_visible = false;
};

// 2. 리스트에서 특정 계획서를 "클릭"했을 때
const handleIdDetail = (planId) => {
    selectPlan.value = planId; // 클릭한 계획서 ID를 변수에 저장
    viewMode.value = 'plan'; // 우측 화면을 '상세보기' 모드로 변경
};
</script>

<template>
    <header class="main-header"></header>

    <div class="dashboard-container">
        <!-- 🟢 왼쪽 사이드 패널 -->
        <aside class="side-panel">
            <section class="info-section">
                <!-- BeneficiaryInfo는 스토어만 고치면 되므로 이벤트 리스너 제거 -->
                <BeneficiaryInfo />
            </section>

            <section class="list-section">
                <!-- 탭 클릭 또는 상세 클릭 시 부모의 viewMode를 변경하도록 이벤트 연결 -->
                <BeneficiaryManagement @change-tab="handleTabChange" @select-plan="handleIdDetail" />
            </section>
        </aside>

        <!-- 🔵 오른쪽 메인 콘텐츠 영역 (viewMode에 따라 컴포넌트 교체) -->
        <main class="main-content">
            <!-- 모드 1: 지원 계획서 상세 화면 -->
            <div v-if="viewMode === 'plan'" class="editor-container">
                <MemberSupportDetail :planId="selectPlan" />
            </div>

            <!-- 모드 2: 지원 신청서 (설문조사 폼) 화면 -->
            <!-- 💡 주의: MemberSurvey 내부에 is_survey_visible 토글 로직이 있다면 충돌할 수 있으니 확인 필요 -->
            <div v-else-if="viewMode === 'survey' || surveyStore.is_survey_visible" class="editor-container">
                <SurveyApplicationForm />
            </div>

            <!-- 기본 모드: 빈 화면 -->
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
