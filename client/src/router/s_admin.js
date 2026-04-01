// systemAdmin 라우트는 "설문지 구조를 관리하는 역할"에 집중되어 있다.
// 지금은 화면 수가 많지 않아서 단순 배열로 유지하고,
// 추후 기능이 늘어나면 survey/users처럼 파일 분리를 해도 된다.
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
