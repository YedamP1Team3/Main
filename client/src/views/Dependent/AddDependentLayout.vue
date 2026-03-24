<template>
    <div class="member-layout-container">
        <header class="header-wrapper">
            <mTopbar />
        </header>

        <main class="member-main-content">
            <aside class="sidebar">
                <div class="user-info-box">
                    <p class="user-role">{{ userRoleName }}</p>
                    <h3 class="user-name">신재성 님</h3>
                </div>

                <nav class="side-nav">
                    <router-link to="/Dependent/info" class="nav-item" active-class="active">내 정보 관리</router-link>
                    <router-link to="/Dependent/add" class="nav-item" active-class="active">지원대상자 추가</router-link>
                </nav>

                <button type="button" class="btn-withdraw">회원탈퇴</button>
            </aside>

            <section class="content-body">
                <div class="inner-content">
                    <router-view />
                </div>
            </section>
        </main>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import mTopbar from '@/layout/member/mTopbar.vue';

/**
 * 사용자 권한 설정
 * ROLE_USER: 일반이용자
 * ROLE_ORG_MGR: 기관담당자
 * ROLE_ORG_ADMIN: 기관관리자
 * ROLE_SYSTEM_ADMIN: 시스템관리자
 */
const currentUserRole = ref('ROLE_USER');

const userRoleName = computed(() => {
    switch (currentUserRole.value) {
        case 'ROLE_USER':
            return '일반이용자';
        case 'ROLE_ORG_MGR':
            return '기관담당자';
        case 'ROLE_ORG_ADMIN':
            return '기관관리자';
        case 'ROLE_SYSTEM_ADMIN':
            return '시스템관리자';
        default:
            return '사용자';
    }
});
</script>

<style scoped>
/* 전체 레이아웃 컨테이너 */
.member-layout-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    overflow: hidden;
}

.member-main-content {
    flex: 1;
    display: flex;
    overflow: hidden;
}

/* 사이드바 스타일 */
.sidebar {
    width: 260px;
    border-right: 1px solid #eeeeee;
    padding: 60px 24px;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    background-color: #fff;
}

.user-info-box {
    margin-bottom: 50px;
}

.user-role {
    font-size: 13px;
    color: #888;
    margin-bottom: 6px;
}

.user-name {
    font-size: 19px;
    font-weight: 700;
    color: #333;
}

.side-nav {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.nav-item {
    text-decoration: none;
    color: #666;
    font-size: 16px;
    padding: 10px 0;
}

.nav-item.active {
    color: #000;
    font-weight: 800;
    border-bottom: 2px solid #333;
    width: fit-content;
}

/* 본문 영역: 중앙 정렬 및 왼쪽 잘림 방지 핵심 스타일 */
.content-body {
    flex: 1;
    background-color: #fcfcfc;
    overflow-y: auto;
    /* 1. 사이드바와 본문 사이 간격을 넉넉히(150px) 주어 잘림 방지 */
    padding: 60px 150px;
}

.inner-content {
    /* 2. 본문 너비를 제한하고 margin: 0 auto로 중앙 정렬 */
    max-width: 900px;
    margin: 0 auto;
}

/* 스크롤바 숨기기 디자인 */
.content-body::-webkit-scrollbar {
    display: none;
}
.content-body {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.btn-withdraw {
    margin-top: auto;
    background: none;
    border: none;
    color: #ff4d4f;
    cursor: pointer;
    text-align: left;
    font-size: 14px;
}
</style>
