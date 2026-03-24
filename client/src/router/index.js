import sAdmin from '@/layout/sAdmin_layout/JsLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { systemAdmin } from './s_admin.js';
import { sakaiLayoutRoutes, sakaiStandaloneRoutes } from './sakai.js';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: sAdmin, // Sakima의 기본 레이아웃 (사이드바, 상단 네비게이션)
            children: [
                ...systemAdmin, // 내가 만든 경로를 먼저 배치 (우선순위 높음)
                ...sakaiLayoutRoutes // 템플릿 UI 참고용 경로들을 뒤에 배치
            ]
        },
        // 레이아웃 바깥에 있는 템플릿 페이지들 전개
        ...sakaiStandaloneRoutes,

        {
            path: '/BeneficiaryMain',
            name: 'beneficiaryMain',
            component: () => import('../views/beneficiary/BeneficiaryMain.vue')
        },
        {
            path: '/login',
            name: 'loginForm',
            component: () => import('../views/signup/loginForm.vue')
        },
        {
            path: '/signup',
            name: 'signupForm',
            component: () => import('../views/signup/signupForm.vue')
        },
        {
            path: '/dashboard',
            name: 'Dashboard',
            component: () => import('../views/Dashboard.vue')
        },
        {
            // 지원대상자 추가 페이지
            path: '/beneficiary/add',
            name: 'AddBeneficiary',
            component: () => import('../views/beneficiary/AddBeneficiary.vue'),
            meta: {
                requiresAuth: true
            }
        }
    ]
});

export default router;
