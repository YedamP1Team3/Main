export const systemAdmin = [
    {
        path: '/survey',
        name: 'survey',
        component: () => import('@/views/system_admin/ServeyCreate.vue')
    },
    {
        path: '/users',
        name: 'users',
        component: () => import('@/views/test.vue')
    }
];
