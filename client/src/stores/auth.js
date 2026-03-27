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

        // 주소 관련 상태 변수 추가
        const userZip = ref(sessionStorage.getItem('userZip') || ''); // 우편번호
        const userAddr1 = ref(sessionStorage.getItem('userAddr1') || ''); // 기본주소
        const userAddr2 = ref(sessionStorage.getItem('userAddr2') || ''); // 상세주소

        const userPhone = ref(sessionStorage.getItem('userPhone') || '');
        const userEmail = ref(sessionStorage.getItem('userEmail') || '');
        const userRegion = ref(sessionStorage.getItem('userRegion') || ''); // 지역명

        const isLoggedIn = computed(() => !!userId.value);

        //[Action] 데이터를 변경하는 함수
        function login(userData) {
            userId.value = userData.user_id || userData.id;
            userName.value = userData.user_name || userData.name;
            userRole.value = userData.role;
            agencyId.value = userData.agency_id;
            agencyName.value = userData.agency_name;

            // 로그인 시 주소 데이터도 함께 저장
            userZip.value = userData.zip_code || '';
            userAddr1.value = userData.address || '';
            userAddr2.value = userData.detail_address || '';

            // 추가 정보 저장 (서버 데이터 필드명에 맞춰주세요)
            userPhone.value = userData.phone || '';
            userEmail.value = userData.email || '';
            userRegion.value = userData.region || '';

            sessionStorage.setItem('userId', userData.user_id);
            sessionStorage.setItem('userName', userData.user_name);
            sessionStorage.setItem('userRole', userData.role);
            sessionStorage.setItem('agencyId', userData.agency_id);
            sessionStorage.setItem('agencyName', userData.agency_name);

            // 세션 스토리지에 주소 정보 저장
            sessionStorage.setItem('userZip', userZip.value);
            sessionStorage.setItem('userAddr1', userAddr1.value);
            sessionStorage.setItem('userAddr2', userAddr2.value);

            sessionStorage.setItem('userPhone', userPhone.value);
            sessionStorage.setItem('userEmail', userEmail.value);
            sessionStorage.setItem('userRegion', userRegion.value);
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

            // 로그아웃 시 주소 정보도 초기화
            userZip.value = '';
            userAddr1.value = '';
            userAddr2.value = '';

            userPhone.value = '';
            userEmail.value = '';
            userRegion.value = '';

            sessionStorage.clear();
        }
        return {
            userId,
            userName,
            userRole,
            agencyId,
            agencyName,
            userZip,
            userAddr1,
            userAddr2,
            userPhone,
            userEmail,
            userRegion,
            isLoggedIn,
            login,
            logout
        };
    },
    {
        persist: { storage: sessionStorage }
    }
);
