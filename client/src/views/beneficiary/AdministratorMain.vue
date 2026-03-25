<script setup>
import { ref } from 'vue';

// 우리가 만든 컴포넌트들을 가져옵니다.
import JsTopbarad from '@/layout/manger/JsTopbarmg.vue';
import AdSupportInfo from '@/components/admin/supportplan/adbeneficiary/AdSupportInfo.vue';
import AdminManagement from '@/components/admin/supportplan/adbeneficiary/AdminManagement.vue';
import AdplanDetail from '@/components/admin/supportplan/adbeneficiary/AdplanDetail.vue';

const selectedId = ref('');
const selectedPriorityId = ref(null);
const viewMode = ref('empty');
const managementRef = ref(null); //새로고침
const selectPlan = ref(null);

//지원자를 새로 선택했을때
const handleIdUpdate = (id, priorityId) => {
    selectedId.value = id;
    selectedPriorityId.value = priorityId;
    viewMode.value = 'empty'; //대상자가 바뀌면 입력창 닫음
};

const handleIdDetail = (planId) => {
    selectPlan.value = planId;
    viewMode.value = 'detail';
};

//저장후 새로고침 하는 함수
const reloadList = () => {
    if (managementRef.value) {
        managementRef.value.refreshTabPlan();
    }
    viewMode.value = 'empty';
};
</script>
<template>
    <header class="main-header">
        <JsTopbarad />
    </header>

    <div class="dashboard-container">
        <aside class="side-panel">
            <section class="info-section">
                <AdSupportInfo @updateBeneId="handleIdUpdate" />
            </section>

            <section class="list-section">
                <AdminManagement ref="managementRef" :beneId="selectedId" @select-plan="handleIdDetail" @newaddplan="viewMode = 'create'" />
            </section>
        </aside>

        <main class="main-content">
            <div v-if="viewMode === 'detail'" class="editor-container">
                <AdplanDetail :planId="selectPlan" :beneId="selectedId" :priorityId="selectedPriorityId" @cancel="viewMode = 'empty'" @refresh="reloadList" />
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
