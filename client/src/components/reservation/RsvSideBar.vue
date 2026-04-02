<script>
import { RouterLink } from 'vue-router';

export default {
    name: 'RsvSideBar',
    components: {
        RouterLink
    }
};
</script>

<template>
    <aside class="rsv-sidebar">
        <div class="sidebar-title">상담 메뉴</div>

        <nav class="sidebar-menu">
            <RouterLink :to="{ name: 'managereservation' }" class="menu-item" active-class="active"> 상담예약 관리 </RouterLink>

            <RouterLink to="/" class="menu-item" active-class="active"> 상담일지 작성 </RouterLink>

            <RouterLink :to="{ name: 'manageCounsel' }" class="menu-item" active-class="active"> 상담일지 관리 </RouterLink>

            <RouterLink :to="{ name: 'schedule' }" class="menu-item" active-class="active"> 상담시간 관리 </RouterLink>
        </nav>
    </aside>
</template>

<style scoped>
.rsv-sidebar {
    width: 220px;
    min-height: 100%;
    padding: 20px 16px;
    background: #fff;
    border-right: 1px solid #e5e7eb;
    box-sizing: border-box;
}

.sidebar-title {
    margin-bottom: 16px;
    padding: 0 4px;
    font-size: 18px;
    font-weight: 700;
    color: #111827;
}

.sidebar-menu {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.menu-item {
    display: block;
    padding: 12px 14px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 500;
    color: #374151;
    text-decoration: none;
    transition: all 0.18s ease;
}

.menu-item:hover {
    background: #f3f4f6;
    color: #111827;
}

.menu-item.active {
    background: #eff6ff;
    color: #2563eb;
    font-weight: 700;
}
</style>
