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

            <hr class="mb-3 mx-3" style="border: 0; border-top: 2px solid #f4e2de; opacity: 1" />

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
    /* ⭐ 중요: 부모의 100%를 가져오되, 최소 높이를 부모에 맞춤 */
    height: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
    margin: 0;
    padding: 0;
    /* 테두리는 부모(.layout-sidebar)에 있으므로 여기선 제외 */
}

/* 2. 상단 메뉴 영역: 내용이 많을 때만 내부 스크롤 발생 */
.sidebar-content {
    flex: 1; /* ⭐ 남은 공간을 모두 차지해서 footer를 아래로 밀어냄 */
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

/* 3. 하단 탈퇴 버튼 영역: 바닥 끝에 딱 붙도록 고정 */
.sidebar-footer {
    flex-shrink: 0;
    padding: 1.5rem 1rem;
    /* 2번째 사진처럼 연한 분홍색 테두리 유지 */
    border-top: 2px solid #f4e2de;
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
    background-color: #fef9f6 !important; /* 옅은 분홍 배경 */
    color: #ffab91 !important; /* 주황빛 포인트 */
    border-left: 4px solid #f3c4b9; /* 왼쪽 강조선 */
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
