<script setup>
import { ref } from 'vue';

// 기존 컴포넌트들
import BeneficiaryInfo from '@/components/member/BeneficiaryInfo.vue';
import BeneficiaryManagement from '@/components/member/MemberManagement.vue';
// ⭐️ 새로 분리할 설문지 컴포넌트 가져오기 (경로는 프로젝트에 맞게 수정하세요)
import SurveyApplicationForm from '@/components/member/MemberSurvey.vue';

const selectedId = ref('');
const selectedPriorityId = ref(null);
const viewMode = ref('empty');
const managementRef = ref(null);

const handleIdUpdate = (id, priorityId) => {
    selectedId.value = id;
    selectedPriorityId.value = priorityId;
    viewMode.value = 'empty';
};
</script>

<template>
    <header class="main-header">
        <JsTopbarmg />
    </header>

    <div class="dashboard-container">
        <aside class="side-panel">
            <section class="info-section">
                <BeneficiaryInfo @updateBeneId="handleIdUpdate" />
            </section>

            <section class="list-section">
                <BeneficiaryManagement ref="managementRef" :beneId="selectedId" />
            </section>
        </aside>

        <main class="main-content">
            <SurveyApplicationForm />
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

/* 🟢 왼쪽 사이드 패널 (600px) */
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

/* 🔵 오른쪽 메인 콘텐츠 영역 (크기 및 스크롤 설정만 남김) */
.main-content {
    flex: 1;
    background-color: #ffffff;
    padding: 40px;
    overflow-y: auto;
}
</style>
