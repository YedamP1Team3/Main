<script setup>
import memberSid from './mSidebar.vue';
</script>

<template>
    <div class="sidebar-layout">
        <member-sid class="side-nav" />

        <div class="side-content">
            <router-view />
        </div>
    </div>
</template>

<style scoped>
.sidebar-layout {
    display: flex;
    flex: 1;
}
.side-nav {
    width: 250px;
    flex-shrink: 0;
}
.side-content {
    flex: 1;
    padding: 2rem;
}
</style>
