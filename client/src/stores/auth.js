import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    //새로고침 시 데이터가 초기화되는 것을 막기 위함
    const userId = ref(sessionStorage.getItem('userId') || '');
    const userName = ref(sessionStorage.getItem('userName') || '');
    const userRole = ref(sessionStorage.getItem('userRole') || '');

    //[Action] 데이터를 변경하는 함수
    function login(userData) {
        userId.value = userData.user_id;
        userName.value = userData.user_name;
        userRole.value = userData.role;

        sessionStorage.setItem('userId', userData.user_id);
        sessionStorage.setItem('userName', userData.user_name);
        sessionStorage.setItem('userRole', userData.role);
    }

    function logout() {
        userId.value = '';
        userName.value = '';
        userRole.value = '';
        sessionStorage.clear();
    }
    return { userId, userName, userRole, login, logout };
});
