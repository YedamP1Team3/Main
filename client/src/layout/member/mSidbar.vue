<script setup>
import { useRouter } from 'vue-router';
import { useSurveyStore } from '@/stores/useSurveyStore';
import { storeToRefs } from 'pinia';

const router = useRouter();
const surveyStore = useSurveyStore();
const { login_user_name } = storeToRefs(surveyStore);

const navigateTo = (routeName) => {
    router.push({ name: routeName });
};

const confirmWithdraw = () => {
    if (confirm('정말로 탈퇴하시겠습니까?')) {
        alert('탈퇴 처리되었습니다.');
    }
};
</script>

<template>
    <div class="layout-sidebar-container">
        <div class="user-info-section px-4 py-4">
            <span class="text-xs text-color-secondary block mb-1">일반이용자</span>
            <h3 class="user-name-text font-bold m-0">
                {{ login_user_name ? `${login_user_name} 님` : '로그인이 필요합니다' }}
            </h3>
        </div>

        <hr class="mb-3 mx-3 border-top-1 surface-border" />

        <ul class="layout-menu list-none p-0 m-0 flex-grow-1">
            <li class="menu-item px-4 py-3 cursor-pointer hover:surface-hover transition-colors" @click="navigateTo('myInfo')">
                <span class="font-medium text-base">내 정보 관리</span>
            </li>

            <li class="menu-item px-4 py-3 cursor-pointer hover:surface-hover active-menu-link" @click="navigateTo('mApplication')">
                <span class="font-medium text-base">지원대상자 추가</span>
            </li>
        </ul>

        <div class="withdraw-section mt-auto p-4 border-top-1 surface-border">
            <button type="button" class="withdraw-btn" @click="confirmWithdraw">회원탈퇴</button>
        </div>
    </div>
</template>

<style scoped>
/* 1. 사이드바 외부의 모든 간격과 그림자 박멸 */
.layout-sidebar-container {
    position: fixed;
    left: 0;
    top: 64px; /* 헤더 높이와 정확히 맞물리게 조정 (Sakai 기본 약 64px) */
    width: 250px;
    height: calc(100vh - 64px);
    display: flex;
    flex-direction: column;
    background-color: #ffffff;

    /* 경계선 및 그림자 강제 제거 */
    border: none !important;
    border-right: none !important;
    box-shadow: none !important;

    /* 외부 여백 완전 제거 */
    margin: 0 !important;
    padding: 0 !important;

    z-index: 999;
}

/* 2. 사용자 이름 텍스트: 한 줄 유지 */
.user-name-text {
    font-size: 1.05rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #334155;
}

/* 3. 활성화된 메뉴 강조 */
.active-menu-link {
    background-color: var(--primary-50);
    color: var(--primary-color);
    border-left: 4px solid var(--primary-color);
}

.active-menu-link span {
    text-decoration: underline;
    text-underline-offset: 6px;
}

/* 4. 하단 회원탈퇴 버튼 */
.withdraw-btn {
    background: transparent;
    border: none;
    color: #ef4444;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    padding: 0;
}

.text-color-secondary {
    color: var(--text-color-secondary);
}

/* 5. 혹시 모를 내부 요소의 마진 제거 */
.user-info-section {
    width: 100%;
}
</style>
