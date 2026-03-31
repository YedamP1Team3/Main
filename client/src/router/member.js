export const member = [
    {
        path: '/memberApplication',
        name: 'mApplication',
        component: () => import('@/views/member/ApplicationForm.vue')
    },
    {
        path: '/mypage',
        name: 'myPageMain',
        component: () => import('@/views/mypage/MyPageForm.vue'),
        // ⭐ 추가: /mypage 접속 시 자동으로 /mypage/info로 보냅니다.
        redirect: { name: 'myInfo' },
        children: [
            {
                path: '/recipient',
                name: 'recipientList',
                component: () => import('@/components/member/mypage/recipient/Recipient.vue')
            },
            {
                path: '/recipient/edit/:id',
                name: 'recipientEdit',
                component: () => import('@/components/member/mypage/info/RecipientEdit.vue')
            },
            {
                path: '/info',
                name: 'myInfo',
                component: () => import('@/components/member/mypage/info/MemberInfo.vue')
            },
            {
                path: '/info/edit',
                name: 'myInfoEdit',
                component: () => import('@/components/member/mypage/info/MemberEdit.vue')
            }
        ]
    },
    {
        path: '/homepage',
        name: 'mHomepage',
        component: () => import('@/views/member/HomePage.vue')
    }
];
