import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore(
    'auth',
    () => {
        // persist 플러그인이 알아서 복원해주므로 빈 값('')으로 초기화해도 돼
        const userId = ref('');
        const userName = ref('');
        const userRole = ref('');
        const agencyId = ref('');
        const agencyName = ref('');

        const isLoggedIn = computed(() => !!userId.value);

        function login(userData) {
            // 백엔드에서 내려주는 키값이 id인지 user_id인지에 따라 유연하게 대처
            userId.value = userData.user_id || userData.id || '';
            userName.value = userData.user_name || userData.name || '';
            userRole.value = userData.role || '';
            agencyId.value = userData.agency_id || '';
            agencyName.value = userData.agency_name || '';
        }

        async function logout() {
            // 필요시 여기에 await axios.post('/api/logout') 추가
            userId.value = '';
            userName.value = '';
            userRole.value = '';
            agencyId.value = '';
            agencyName.value = '';
            sessionStorage.clear(); // 스토리지 완전 찌꺼기 제거용
        }

        function updateName(newName) {
            userName.value = newName;
        }

        return {
            userId,
            userName,
            userRole,
            agencyId,
            agencyName,
            isLoggedIn,
            login,
            logout,
            updateName
        };
    },
    {
        // 이 한 줄이 핵심: 상태가 바뀔 때마다 알아서 sessionStorage에 동기화됨
        persist: { storage: sessionStorage }
    }
);
