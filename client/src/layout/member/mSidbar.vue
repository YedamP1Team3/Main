<script setup>
import { useRouter, useRoute } from 'vue-router';
import { useSurveyStore } from '@/stores/useSurveyStore';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const router = useRouter();
const route = useRoute(); // 현재 경로 정보를 담은 객체

const surveyStore = useSurveyStore();
const { login_user_name } = storeToRefs(surveyStore);

const authStore = useAuthStore();
const { userName, userRole } = storeToRefs(authStore);

const navigateTo = (routeName) => {
    router.push({ name: routeName });
};

const goToRecipientList = () => {
    router.push({ name: 'recipientList' });
};

const confirmWithdraw = () => {
    if (confirm('정말로 탈퇴하시겠습니까?')) {
        alert('탈퇴 처리되었습니다.');
    }
};
</script>

<template>
    <div class="layout-sidebar-container">
        <div class="sidebar-content">
            <div class="user-info-section px-4 py-4">
                <span class="text-xs text-color-secondary block mb-1">
                    {{ userRole === 'FAMILY' ? '일반이용자' : '이용자' }}
                </span>
                <h3 class="user-name-text font-bold m-0">
                    {{ authStore.isLoggedIn && userName ? `${userName}님` : '로그인이 필요합니다' }}
                </h3>
            </div>

            <hr class="mb-3 mx-3 border-top-1 surface-border" />

            <ul class="layout-menu list-none p-0 m-0">
                <li class="menu-item px-4 py-3 cursor-pointer hover:surface-hover transition-colors" :class="{ 'active-menu-link': route.name === 'myInfo' }" @click="navigateTo('myInfo')">
                    <span class="font-medium text-base">내 정보 관리</span>
                </li>

                <li class="menu-item px-4 py-3 cursor-pointer hover:surface-hover transition-colors" :class="{ 'active-menu-link': route.name === 'recipientList' }" @click="goToRecipientList">
                    <span class="font-medium text-base">지원대상자 추가</span>
                </li>
            </ul>
        </div>

        <div class="sidebar-footer p-4 border-top-1 surface-border">
            <button type="button" class="withdraw-btn" @click="confirmWithdraw">회원탈퇴</button>
        </div>
    </div>
</template>

<style scoped>
/* 1. 사이드바 전체 컨테이너: 부모(.layout-sidebar)의 높이를 100% 사용 */
.layout-sidebar-container {
    width: 100%;
    height: 100%; /* 👈 부모가 bottom: 0이라서 위아래 끝까지 꽉 찹니다 */
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
    margin: 0 !important;
    padding: 0 !important;
}

/* 2. 상단 메뉴 영역: 내용이 많을 때만 내부 스크롤 발생 */
.sidebar-content {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

/* 3. 하단 탈퇴 버튼 영역: 바닥 끝에 딱 붙도록 고정 */
.sidebar-footer {
    flex-shrink: 0;
    padding: 1.5rem 1rem; /* 바닥 여백을 적절히 주어 버튼이 안 잘리게 함 */
    border-top: 1px solid #f1f5f9;
    background-color: #ffffff;
}

/* 4. 기존 텍스트 및 메뉴 스타일 유지 */
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
