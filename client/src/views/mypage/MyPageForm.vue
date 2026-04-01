<script setup>
import mTopbar from '../../layout/member/mTopbar.vue';
import memberSid from '../../layout/member/mSidbar.vue';
</script>

<template>
    <div class="layout-wrapper">
        <header class="layout-header">
            <mTopbar />
        </header>

        <div class="layout-body">
            <aside class="layout-sidebar">
                <memberSid />
            </aside>

            <main class="layout-main">
                <router-view :key="$route.fullPath" />
            </main>
        </div>
    </div>
</template>

<style scoped>
/* 1. 바디 레이아웃 - 높이 계산을 더 안전하게 조정 */
.layout-body {
    position: relative;
    display: flex;
    width: 100%;
    min-height: calc(100vh - 64px); /* 고정 height 대신 min-height 사용 */
    margin-top: 64px;
    background-color: #f8fafc;

    /* ⭐ 수정: 여기서 overflow: hidden을 제거합니다 */
    overflow: visible;
    box-sizing: border-box;
}

/* 2. 사이드바 - 바닥에 0.1px의 오차도 없게 밀착 */
.layout-sidebar {
    position: fixed; /* absolute 대신 fixed를 써야 본문이 길어져도 따라옵니다 */
    top: 64px;
    left: 0;
    bottom: 0;
    width: 250px;
    background-color: #ffffff;
    border-right: 1px solid #e2e8f0;
    z-index: 10;
    box-sizing: border-box;
}

/* 3. 본문 영역 - 여기서만 스크롤 허용 */
.layout-main {
    margin-left: 250px;
    width: calc(100% - 250px);

    /* ⭐ 핵심 수정 사항 */
    height: auto; /* 100% 고정 해제 */
    min-height: 100%;
    padding: 1.5rem 2.5rem 2.5rem 2.5rem;
    overflow: visible !important; /* 내부 스크롤 발생 원천 차단 */
    background-color: #f8fafc;
    box-sizing: border-box;
}

/* ⭐ 브라우저 스크롤을 다시 살려냅니다 */
:deep(html),
:deep(body) {
    overflow: auto !important; /* hidden에서 auto로 변경 */
    height: auto;
}
</style>
