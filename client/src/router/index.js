import sAdmin from '@/layout/sAdmin_layout/JsLayout.vue';
import sakayLay from '@/layout/sakima_layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';
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
            path: '/BeneficiaryMain',
            name: 'beneficiaryMain',
            component: () => import('../views/beneficiary/BeneficiaryMain.vue')
        },
        // 레이아웃 바깥에 있는 템플릿 페이지들 전개
        ...sakaiStandaloneRoutes
    ]
});

export default router;
