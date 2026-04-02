<script setup>
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const { userName, userId, userRole } = storeToRefs(authStore);

const navigateTo = (routeName) => {
    if (routeName === 'managerInfo') {
        router.push({
            name: routeName,
            params: { id: userId.value }
        });
    } else {
        router.push({ name: routeName });
    }
};

// [수정] 담당 지원자 목록으로 이동하는 함수
const goToManagerBeneficiaryList = () => {
    // 실제 라우터 설정에 맞춰 이름을 수정하세요 (예: 'managerBeneficiaryList')
    router.push({ name: 'managerBeneficiaryList' });
    // alert('담당 지원자 목록으로 이동합니다.');
};

const confirmWithdraw = () => {
    if (confirm('정말로 탈퇴하시겠습니까?')) {
        alert('탈퇴 처리되었습니다.');
        // 탈퇴 로직 실행 후 이동
    }
};
</script>

<template>
    <div class="layout-sidebar-container">
        <div class="sidebar-content">
            <div class="user-info-section px-4 py-4">
                <span class="text-xs text-color-secondary block mb-1">
                    {{ userRole === 'MANAGER' ? '기관담당자' : '담당자' }}
                </span>
                <h3 class="user-name-text font-bold m-0">
                    {{ authStore.isLoggedIn && userName ? `${userName}님` : '로그인이 필요합니다' }}
                </h3>
            </div>

            <hr class="mb-3 mx-3 border-top-1 surface-border" />

            <ul class="layout-menu list-none p-0 m-0">
                <li class="menu-item px-4 py-3 cursor-pointer hover:surface-hover transition-colors" :class="{ 'active-menu-link': route.name === 'managerInfo' }" @click="navigateTo('managerInfo')">
                    <span class="font-medium text-base">내 정보 관리</span>
                </li>

                <li class="menu-item px-4 py-3 cursor-pointer hover:surface-hover transition-colors" :class="{ 'active-menu-link': route.name === 'managerBeneficiaryList' }" @click="goToManagerBeneficiaryList">
                    <span class="font-medium text-base">담당 지원자 목록</span>
                </li>
            </ul>
        </div>

        <div class="sidebar-footer p-4 border-top-1 surface-border">
            <button type="button" class="withdraw-btn" @click="confirmWithdraw">회원탈퇴</button>
        </div>
    </div>
</template>

<style scoped>
/* 기존 스타일 그대로 유지 */
.layout-sidebar-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
    margin: 0 !important;
    padding: 0 !important;
}

.sidebar-content {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.sidebar-footer {
    flex-shrink: 0;
    padding: 1.5rem 1rem;
    border-top: 1px solid #f1f5f9;
    background-color: #ffffff;
}

.user-name-text {
    font-size: 1.05rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #334155;
}

.active-menu-link {
    background-color: #f0fdf4 !important;
    color: #10b981 !important;
    border-left: 4px solid #10b981;
}

.active-menu-link span {
    font-weight: 700 !important;
}

.withdraw-btn {
    background: transparent;
    border: none;
    color: #ef4444;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    padding: 0;
    text-align: left;
    width: 100%;
}

.withdraw-btn:hover {
    text-decoration: underline;
}

.text-color-secondary {
    color: #64748b;
}
</style>
