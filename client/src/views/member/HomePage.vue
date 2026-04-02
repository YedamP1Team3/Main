<script setup>
import { ref } from 'vue';
import SearchSidebar from '@/layout/member/SearchSidebar.vue';
import HistoryTable from '@/components/member/homepage/HistoryTable.vue';

const getInitialFilters = () => ({
    startDate: '',
    endDate: '',
    beneName: '',
    managerName: '',
    status: 'all',
    progress: 'all'
});

const filters = ref(getInitialFilters());

const handleSearch = (nextFilters) => {
    filters.value = nextFilters;
};

const handleReset = () => {
    filters.value = getInitialFilters();
};
</script>

<template>
    <header class="main-header"></header>

    <div class="history-page-container">
        <SearchSidebar @search="handleSearch" @reset="handleReset" />
        <HistoryTable :filters="filters" />
    </div>
</template>

<style scoped>
.main-header {
    width: 100%;
    height: 64px;
    background-color: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 100;
}

.history-page-container {
    display: flex;
    width: 100%;
    min-height: calc(100vh - 64px);
    background-color: #f8fafc;
    padding: 20px;
    gap: 20px;
}
</style>
