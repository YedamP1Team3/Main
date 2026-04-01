export const manager = [
    {
        path: '',
        name: 'mgmyPageMain',
        component: () => import('@/views/MgMypage/MgMypageForm.vue'),
        redirect: { name: 'managerBeneficiaryList' },
        children: [
            {
                // [수정] 헤더에서 넘겨주는 id를 받기 위해 :id 추가
                path: '/my-info/:id',
                name: 'managerInfo',
                component: () => import('@/components/manager/mypage/info/ManagerInfo.vue'),
                // props: true를 설정하면 컴포넌트에서 더 편하게 id를 쓸 수 있습니다.
                props: true
            },
            {
                // [수정] 헤더에서 넘겨주는 id를 받기 위해 :id 추가
                path: '/my-info-edit/:id',
                name: 'managerInfoedit',
                component: () => import('@/components/manager/mypage/info/ManagerEdit.vue'),
                // props: true를 설정하면 컴포넌트에서 더 편하게 id를 쓸 수 있습니다.
                props: true
            },
            {
                path: '/recipient-list',
                name: 'managerBeneficiaryList',
                component: () => import('@/components/manager/mypage/management/ManagedRecipientList.vue')
            }
        ]
    },
    {
        path: '/manager-home',
        name: 'm_home',
        component: () => import('@/views/manager/manager_home.vue')
    }
];
