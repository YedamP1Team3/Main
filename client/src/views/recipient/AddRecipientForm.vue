<script setup>
// import { ref } from 'vue';
import mTopbar from '../../layout/member/mTopbar.vue';
import memberSid from '../../layout/member/mSidbar.vue';
import mainrecipient from '@/components/member/recipient/Recipient.vue';
</script>

<template>
    <header class="layout-header">
        <mTopbar />
    </header>

    <div class="layout-body">
        <aside class="layout-sidebar">
            <memberSid />
        </aside>

        <main class="layout-main">
            <mainrecipient />
        </main>
    </div>
</template>

<style scoped>
/* 화면 전체 레이아웃 설정 */
.layout-body {
    display: flex; /* 사이드바와 메인을 가로로 나란히 배치 */
    height: calc(100vh - 70px); /* 상단바 높이를 제외한 나머지 전체 높이 (70px은 예시) */
}

.layout-sidebar {
    width: 250px; /* 사이드바 너비 고정 */
    flex-shrink: 0; /* 너비가 줄어들지 않도록 설정 */
    border-right: 1px solid #ccc; /* 구분선 */
}

.layout-main {
    flex: 1; /* 남은 공간을 모두 차지 */
    padding: 2rem; /* 본문 내부 여백 */
    overflow-y: auto; /* 내용이 많아지면 본문만 스크롤 */
    background-color: #f9f9f9;
}
</style>
