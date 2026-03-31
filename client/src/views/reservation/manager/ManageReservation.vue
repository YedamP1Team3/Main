<script>

import JsTopbarmg from '@/layout/manger/JsTopbarmg.vue';
import RsvSideBar from '@/components/reservation/RsvSideBar.vue';
import RsvTable from '@/components/common/RsvTable.vue';

export default {
    components: {
        JsTopbarmg,
        RsvSideBar,
        RsvTable,
    },

    setup() {
    }
</script>

<template>
    <div class="page">
        <header class="layout-header">
            <JsTopbarmg />
        </header>
        <div class="layout-body">
            <RsvSideBar />
            <main class="layout-main">
                <div class="reservation-container">
                    <RsvTable :columns="reservationColumns" :rows="reservationRows" rowKey="rsv_id" emptyMessage="상담 신청 내역이 없습니다." @action-click="handleTableActionClick" />
                </div>
            </main>
        </div>
    </div>
</template>

<style scoped></style>
