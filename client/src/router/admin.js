export const admin = [
    {
        path: '/mypage',
        name: 'adpagemain',
        component: () => import('@/views/AdMypage/AdMypageForm.vue'),
        redirect: { name: 'admincenterinfo' },
        children: [
            {
                path: '/ad-info/:id',
                name: 'admininfo',
                component: () => import('@/components/admin/mypage/info/AdminInfo.vue'),
                // props: true를 설정하면 컴포넌트에서 더 편하게 id를 쓸 수 있습니다.
                props: true
            },
            // {
            //     path: '/ad-info-edit/:id',
            //     name: 'admininfoedit',
            //     component: () => import('@/components/admin/mypage/info/AdminInfoEdit.vue'),
            //     // props: true를 설정하면 컴포넌트에서 더 편하게 id를 쓸 수 있습니다.
            //     props: true
            // },
            {
                path: '/center-info',
                name: 'admincenterinfo',
                component: () => import('@/components/admin/mypage/centerinfo/Admincenterinfo.vue')
            },
            {
                path: '/adjoin-family',
                name: 'adjoinfamily',
                component: () => import('@/components/admin/registration/adjoin-family/AdFamilyJoinList.vue'),
                meta: { sidebar: 'TySidbarsinup' }
            },
            {
                path: '/adjoin-manager',
                name: 'adjoinmanager',
                component: () => import('@/components/admin/registration/adjoin-manager/AdManagerJoinList.vue'),
                meta: { sidebar: 'TySidbarsinup' }
            }
        ]
    }
];
