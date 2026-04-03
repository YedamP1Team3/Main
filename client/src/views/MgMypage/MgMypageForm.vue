<script setup>
import JsTopbarmg from '@/layout/manager/JsTopbarmg.vue';
import JsSidbarmg from '@/layout/manager/JsSidbarmg.vue';
</script>

<template>
    <div class="layout-wrapper">
        <JsTopbarmg />

        <div class="layout-body">
            <aside class="layout-sidebar">
                <JsSidbarmg />
            </aside>

            <main class="layout-content">
                <div class="content-viewport">
                    <router-view />
                </div>
            </main>
        </div>
    </div>
</template>

<style scoped>
.layout-wrapper {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.layout-body {
    display: flex;
    flex: 1;
    overflow: hidden;
    background-color: #f8fafc;
}

.layout-sidebar {
    width: 280px;
    flex-shrink: 0;
    background: white;
    border-right: 1px solid #e2e8f0;
    z-index: 10;
}

.layout-content {
    flex: 1;
    overflow-y: auto;
    /* [수정] 기존 40px에서 10px을 더해 50px로 설정 (본문이 더 내려옵니다) */
    padding: 50px 2rem 2rem 2rem !important;
}

/* [추가] ManagerInfo.vue의 내용이 너무 퍼지지 않게 잡아주는 설정 */
.content-viewport {
    max-width: 1200px;
    margin: 0 auto;
}
</style>
