import sAdmin from '@/layout/sAdmin_layout/JsLayout.vue';
import sakayLay from '@/layout/sakima_layout/AppLayout.vue';
import memberLay from '@/layout/member/mLayout.vue';
import managerTop from '@/layout/manager/JsTopbarmg.vue';
// import memberSid from '@/layout/member/mSidbar.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { member } from './member.js';
import { manager } from './manager.js';
import { admin } from './admin.js';
import { systemAdmin } from './s_admin.js';
import { sakaiLayoutRoutes, sakaiStandaloneRoutes } from './sakai.js';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: sakayLay, // Sakima의 기본 레이아웃 (사이드바, 상단 네비게이션)
            children: [
                ...sakaiLayoutRoutes // 템플릿 UI 참고용 경로들을 뒤에 배치
            ]
        },
        {
            path: '/sAdmin',
            name: 'sAdmin',
            component: sAdmin, // Sakima의 기본 레이아웃 (사이드바, 상단 네비게이션)
            children: [
                ...systemAdmin // 내가 만든 경로를 먼저 배치 (우선순위 높음)
            ]
        },

        {
            path: '/member',
            name: 'member',
            component: memberLay, // Sakima의 기본 레이아웃 (사이드바, 상단 네비게이션)
            children: [
                ...member // 내가 만든 경로를 먼저 배치 (우선순위 높음)
            ]
        },
        {
            path: '/beneficiaryMain',
            name: 'beneficiaryMain',
            component: () => import('../views/manager/BeneficiaryMain.vue')
        },
        {
            path: '/manager',
            // component: managerTop,
            children: [
                ...manager // 기관 담당자 관련 router (우선 마이페이지 관련만 있음)
            ]
        },
        {
            path: '/admin',
            // component: managerTop,
            children: [
                ...admin // 기관 담당자 관련 router (우선 마이페이지 관련만 있음)
            ]
        },
        {
            // 로그인 페이지
            path: '/login',
            name: 'loginForm',
            component: () => import('../views/signup/loginForm.vue')
        },
        {
            // 회원가입 페이지
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
            path: '/Schedule',
            name: 'schedule',
            component: () => import('../views/reservation/manager/ManagerSchedule.vue')
        },
        {
            path: '/manageReservation',
            name: 'managereservation',
            component: () => import('../views/reservation/manager/ManageReservation.vue')
        },
        {
            path: '/reservation',
            name: 'reservation',
            component: () => import('../views/reservation/family/Rservation.vue')
        },
        {
            path: '/manageCounsel',
            name: 'managecounsel',
            component: () => import('../views/reservation/manager/ManageConusel.vue')
        },
        {
            path: '/administratorMain',
            name: 'administratorMain',
            component: () => import('../views/beneficiary/AdministratorMain.vue')
        },
        // 레이아웃 바깥에 있는 템플릿 페이지들 전개
        ...sakaiStandaloneRoutes
    ]
});

export default router;
