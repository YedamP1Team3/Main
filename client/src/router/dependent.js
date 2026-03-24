// src/router/dependent.js
import MemberLayout from '@/views/Dependent/MemberLayout.vue';
import AddDependent from '@/views/Dependent/AddDependent.vue';

const dependentRoutes = [
    {
        path: '/user',
        component: MemberLayout, // 부모: 틀 (헤더+사이드바)
        children: [
            {
                path: 'add-dependent', // 실제 주소: /user/add-dependent
                name: 'AddDependent',
                component: AddDependent // 자식: 알맹이 (입력 폼)
            }
            // 나중에 '내 정보 관리'가 생기면 여기에 추가
        ]
    }
];

export default dependentRoutes;
