<template>
    <div class="sidebar">
        <!-- 헤더 -->
        <div class="sidebar-header">
            <h2>관리자</h2>
        </div>

        <!-- 메뉴 -->
        <nav class="menu">
            <router-link v-for="item in menuList" :key="item.name" :to="item.path" class="menu-item" :class="{ active: isActive(item.path) }">
                {{ item.label }}
            </router-link>
        </nav>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

// 👉 경로는 네가 맞게 수정하면 됨
const menuList = [
    { name: 'reservation', label: '상담예약 관리', path: '/reservation' },
    { name: 'log-write', label: '상담일지 작성', path: '/log/write' },
    { name: 'log-manage', label: '상담일지 관리', path: '/log/manage' },
    { name: 'schedule', label: '상담일정 관리', path: '/ManagerSchedule' }
];

// 현재 경로와 비교해서 active 처리
const isActive = (path) => {
    return route.path === path;
};
</script>

<style scoped>
.sidebar {
    width: 220px;
    height: 100vh;
    background: #f4f8ff;
    display: flex;
    flex-direction: column;
    padding: 20px 15px;
    box-sizing: border-box;
}

.sidebar-header {
    margin-bottom: 30px;
    padding-left: 10px;
}

.sidebar-header h2 {
    font-size: 18px;
    color: #4a90e2;
}

.menu {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

/* 🔥 router-link 기본 스타일 제거 */
.menu-item {
    text-decoration: none;
    color: #333;
    padding: 12px 14px;
    border-radius: 10px;
    transition: 0.2s;
}

/* hover */
.menu-item:hover {
    background: #e3ecff;
}

/* 활성 메뉴 */
.menu-item.active {
    background: #4a90e2;
    color: white;
    font-weight: bold;
}
</style>
