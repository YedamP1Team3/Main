<script setup>
import AppConfigurator from '../AppConfigurator.vue';

import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const router = useRouter();

const { userName, isLoggedIn, userId } = storeToRefs(authStore);

// [수정] 일반 이용자 헤더와 동일하게 로그아웃 로직 분리
const toggleAuth = () => {
    if (authStore.isLoggedIn) {
        if (confirm('로그아웃 하시겠습니까?')) {
            authStore.logout();
            alert('로그아웃 되었습니다.');
            router.push('/');
        }
    } else {
        router.push('/');
    }
};

const goToregistration = () => {
    router.push({ name: 'adjoinfamily' });
};

const goToPlan = () => {
    router.push('/administratorMain');
};

const goToSchedule = () => {
    // router.push({ name: 'managerSchedule' });
    alert('추후 기능 추가 예정');
};

// [추가] 마이페이지 또는 프로필 이동용 (필요 시)
const goToProfile = () => {
    router.push({
        name: 'admininfo',
        params: { id: userId.value }
    });
};
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <div class="layout-topbar-logo">
                <img src="/image/로고.png" alt="센터 로고" class="topbar-logo-img" />
                <span class="logo-text">발달장애지원센터</span>
            </div>

            <div class="layout-topbar-menu-items ml-6 hidden lg:flex gap-4 whitespace-nowrap">
                <button type="button" class="p-link text-color font-medium" @click="goToregistration">신청내역</button>
                <button type="button" class="p-link text-color font-medium" @click="goToPlan">신청관리</button>
                <button type="button" class="p-link text-color font-medium" @click="goToSchedule">담당자관리</button>
            </div>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <AppConfigurator />
            </div>
        </div>

        <div class="flex items-center gap-2">
            <span class="hidden sm:block font-medium text-color">
                {{ isLoggedIn ? `${userName}관리자님` : '로그인이 필요합니다' }}
            </span>

            <button type="button" class="layout-topbar-action" @click="toggleAuth">
                <i class="pi pi-sign-out" title="로그아웃"></i>
            </button>

            <button type="button" class="layout-topbar-action" @click="goToProfile">
                <i class="pi pi-user"></i>
                <span class="hidden">Profile</span>
            </button>
        </div>
    </div>
</template>

<style scoped>
@font-face {
    font-family: 'NanumSquareRound';
    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_two@1.0/NanumSquareRound.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}
/* 반응형 겹침 방지: 로고 구역 고정 너비 해제 */
.layout-topbar-logo {
    display: flex;
    align-items: center;
    width: auto !important; /* 기본 테마의 고정 너비 강제 해제 */
    margin-right: 3rem; /* 메뉴와의 최소 안전 거리 확보 */
}

/* 긴 센터명 텍스트 깔끔하게 처리 */
.logo-text {
    /* 추천 폰트 적용 */
    font-family: 'NanumSquareRound', sans-serif;

    font-size: 1.5rem; /* 폰트 특성에 맞춰 크기 살짝 조절 */
    font-weight: 800; /* 둥근 느낌을 강조하기 위해 굵게 설정 */
    white-space: nowrap;
    letter-spacing: -0.8px; /* 둥근 폰트는 자간을 조금 더 조이는 게 예쁩니다 */

    /* 세련된 오로라 그라데이션 적용 */
    background: linear-gradient(135deg, #ffab91 0%, #ffcda5 40%, #e9d5ff 70%, #bae6fd 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-top: 3px;

    /* 부드러운 흐름 애니메이션 추가 (선택 사항) */
    background-size: 200% auto;
    animation: gradientMove 5s ease infinite;
}

@keyframes gradientMove {
    0% {
        background-position: 0% center;
    }
    50% {
        background-position: 100% center;
    }
    100% {
        background-position: 0% center;
    }
}
/* 로고 이미지 크기 조절 */
.topbar-logo-img {
    height: 50px;
    width: auto;
    object-fit: contain;
}

/* 메뉴 아이템 레이아웃 유지 */
.layout-topbar-menu-items {
    display: flex;
    align-items: center;
    font-size: 1.1rem;
}

.p-link {
    padding: 0.5rem 1rem;
    cursor: pointer;
    background: none;
    border: none;
    border-radius: 6px;
    transition: background-color 0.2s;
}

.p-link:hover {
    background-color: var(--surface-hover);
}
</style>
