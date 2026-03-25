<script setup>
// 1. 자식 컴포넌트 임포트
// (이 파일은 앱의 전체적인 레이아웃 구조만 잡아주는 역할을 합니다)
import BeneficiaryInfo from '@/components/member/m_application/m_BeneficiaryInfo.vue';
import BeneficiaryManagement from '@/components/member/m_application/MemberManagement.vue';
import SurveyApplicationForm from '@/components/member/m_application/MemberSurvey.vue';

// 💡 모든 데이터의 상태 변경(id, 모드 등)은 스토어(Pinia)에서 알아서 처리하므로
// 부모 컴포넌트에 불필요한 로컬 변수나 이벤트 리스너를 둘 필요가 없습니다!
</script>

<template>
    <!-- 상단 공통 헤더 -->
    <header class="main-header"></header>

    <div class="dashboard-container">
        <!-- 🟢 왼쪽 사이드 패널: 지원자 기본 정보 및 신청서/계획서 등 목록 관리 -->
        <aside class="side-panel">
            <section class="info-section">
                <BeneficiaryInfo />
            </section>

            <section class="list-section">
                <!-- 불필요했던 ref="managementRef" 바인딩도 깔끔하게 제거했습니다 -->
                <BeneficiaryManagement />
            </section>
        </aside>

        <!-- 🔵 오른쪽 메인 콘텐츠 영역: 선택된 메뉴에 따른 폼(설문조사 등) 출력 -->
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

/* 🔵 오른쪽 메인 콘텐츠 영역 (남은 공간 모두 차지, 내부 스크롤) */
.main-content {
    flex: 1;
    background-color: #ffffff;
    padding: 40px;
    overflow-y: auto;
}
</style>
