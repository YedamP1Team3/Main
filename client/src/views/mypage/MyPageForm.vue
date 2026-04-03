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
/* 1. 전체를 화면 높이(100vh)에 가두어 스크롤이 밖으로 나가지 않게 합니다 */
.layout-wrapper {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden; /* 전체 페이지 스크롤 방지 */
}

/* 2. 바디 영역 */
.layout-body {
    display: flex;
    flex: 1;
    margin-top: 64px;
    background-color: #fef9f6;
    padding: 2rem;
    gap: 2rem;
    box-sizing: border-box;

    /* ⭐ [핵심 추가] 이 한 줄이 사이드바가 본문 따라 길어지는 걸 막아줍니다! */
    align-items: flex-start;

    /* 아래 속성들은 유지하거나 필요 없으면 지우셔도 됩니다 */
    min-height: calc(100vh - 64px);
    overflow: visible;
}

/* 3. 사이드바 - 이제 부모 높이 안에서만 존재하며 길어지지 않습니다 */
.layout-sidebar {
    width: 250px;
    flex-shrink: 0;
    background-color: #ffffff;
    border: 2px solid #f4e2de !important;
    border-radius: 16px;
    z-index: 10;
    box-sizing: border-box;

    /* ⭐ [핵심 수정] 100%가 아니라 화면 높이에 맞춰 고정합니다 */
    /* 100vh(화면전체) - 64px(헤더) - 4rem(위아래 padding 2rem씩) */
    height: calc(100vh - 64px - 4rem) !important;

    /* 화면에 고정시키기 */
    position: sticky;
    top: calc(64px + 2rem);
}

/* 4. 본문 영역 - 본문이 길어지면 '여기서만' 스크롤이 생깁니다 */
.layout-main {
    flex: 1;
    height: 100%;
    /* ⭐ 중요: 사이드바는 가만히 있고 본문만 위아래로 움직이게 함 */
    overflow: hidden !important;
    background-color: transparent;
    box-sizing: border-box;
}
</style>
