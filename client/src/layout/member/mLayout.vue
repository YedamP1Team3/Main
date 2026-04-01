<script setup>
import mTopbar from './mTopbar.vue';
// import JsFooter from './JsFooter.vue';
</script>

<template>
    <div class="member-layout-container">
        <mTopbar />

        <main class="member-main-content">
            <router-view />
        </main>
    </div>
</template>

<style scoped>
.js-layout-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
}

.js-main-content {
    flex: 1;
    overflow: hidden; /* 자식 컴포넌트(ApplicationView)에서 내부 스크롤 제어 */
    background-color: #ffffff;
}
</style>
