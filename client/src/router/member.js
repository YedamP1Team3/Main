export const member = [
    {
        path: '/memberApplication',
        name: 'mApplication',
        component: () => import('@/views/member/ApplicationForm.vue')
    },
    {
        path: '/recipient',
        name: 'addRecipient',
        component: () => import('@/views/recipient/AddRecipientForm.vue')
    }
];
