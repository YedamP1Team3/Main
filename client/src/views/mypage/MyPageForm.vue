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
    /* 🥟 64px 대신 여유를 0.5px 정도 더 주거나, 딱 맞게 고정 */
    height: calc(100vh - 64px);
    margin-top: 64px;
    background-color: #f8fafc;

    /* ⭐ 핵심: 절대 스크롤 안 생기게 차단 */
    overflow: hidden !important;
    box-sizing: border-box;
}

/* 2. 사이드바 - 바닥에 0.1px의 오차도 없게 밀착 */
.layout-sidebar {
    position: absolute;
    top: 0;
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
    /* 사이드바 너비(250px)만큼 왼쪽 마진을 줘서 본문을 오른쪽으로 밉니다 */
    margin-left: 250px;

    /* 너비는 전체에서 250px을 뺀 나머지만 차지하게 설정 */
    width: calc(100% - 250px);

    height: 100%;
    padding: 2.5rem;
    overflow-y: auto;
    background-color: #f8fafc;
    box-sizing: border-box; /* 패딩 때문에 너비가 넘치지 않게 고정 */
}

/* ⭐ 브라우저 기본 여백까지 혹시 모르니 차단 */
:deep(html),
:deep(body) {
    overflow: hidden !important;
    height: 100%;
}
</style>
