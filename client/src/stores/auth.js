import { defineStore } from 'pinia';
import { ref, computed } from 'vue'; //computed  추가 (상태 계산)

export const useAuthStore = defineStore(
    'auth',
    () => {
        //새로고침 시 데이터가 초기화되는 것을 막기 위함
        const userId = ref(sessionStorage.getItem('userId') || '');
        const userName = ref(sessionStorage.getItem('userName') || '');
        const userRole = ref(sessionStorage.getItem('userRole') || '');
        const agencyId = ref(sessionStorage.getItem('agencyId') || '');
        const agencyName = ref(sessionStorage.getItem('agencyName') || '');

        const isLoggedIn = computed(() => !!userId.value);

        //[Action] 데이터를 변경하는 함수
        function login(userData) {
            userId.value = userData.user_id || userData.id;
            userName.value = userData.user_name || userData.name;
            userRole.value = userData.role;
            agencyId.value = userData.agency_id;
            agencyName.value = userData.agency_name;

            sessionStorage.setItem('userId', userData.user_id);
            sessionStorage.setItem('userName', userData.user_name);
            sessionStorage.setItem('userRole', userData.role);
            sessionStorage.setItem('agencyId', userData.agency_id);
            sessionStorage.setItem('agencyName', userData.agency_name);
        }

        function logout() {
            try {
            } catch (error) {
                console.error('로그아웃 서버 통신실패 ', error);
            } finally {
            }
            userId.value = '';
            userName.value = '';
            userRole.value = '';
            agencyId.value = '';
            agencyName.value = '';

            sessionStorage.clear();
        }
        return { userId, userName, userRole, agencyId, agencyName, isLoggedIn, login, logout };
    },
    {
        persist: { storage: sessionStorage }
    }
);
