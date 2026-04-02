<script setup>
import { ref, reactive, computed, onMounted } from 'vue'; // Vue의 핵심 기능(상태관리, 자동실행 등)을 가져옵니다.
import { useAuthStore } from '@/stores/auth'; // 로그인된 사용자의 정보를 관리하는 저장소를 가져옵니다.
import { storeToRefs } from 'pinia'; // 저장소의 데이터를 깨지지 않게 안전하게 꺼내오는 도구입니다.
import axios from 'axios'; // 서버와 데이터를 주고받기 위한 통신 도구입니다.

const authStore = useAuthStore(); // 로그인 정보 저장소를 사용하겠다고 선언합니다.
const { userId } = storeToRefs(authStore); // 저장소에서 현재 로그인한 사용자의 ID만 쏙 뽑아옵니다.

// 1. 화면의 상태를 관리하는 변수들
const isEditMode = ref(false); // 지금이 '보기 모드'인지 '수정 모드'인지 결정하는 스위치입니다.
let originalData = {}; // 수정을 취소했을 때 되돌아가기 위해 원래 데이터를 잠시 보관하는 장바구니입니다.

// 2. 화면에 보여줄 관리자의 상세 정보들 (빈 칸으로 시작합니다)
const adminData = reactive({
    user_name: '', // 관리자 성함
    user_id: '', // 관리자 아이디
    agency_name: '', // 소속된 기관 이름
    zip_code: '', // 우편번호
    address: '', // 기본 주소
    detail_address: '', // 상세 주소
    tel: '', // 전화번호
    email: '' // 이메일 주소
});

// 서버에서 관리자의 실제 정보를 가져오는 함수입니다.
const fetchAdminInfo = async () => {
    try {
        // 내 아이디를 주소에 담아 서버에 "내 정보 좀 보내줘"라고 요청합니다.
        const response = await axios.get(`/api/admypage/${userId.value}`);

        // 서버가 정보를 제대로 보내줬다면 하나씩 화면용 바구니(adminData)에 옮겨 담습니다.
        if (response.data) {
            adminData.user_id = response.data.user_id;
            adminData.user_name = response.data.user_name;
            adminData.agency_name = response.data.agency_name;
            adminData.zip_code = response.data.zip_code;
            adminData.address = response.data.address;
            adminData.detail_address = response.data.detail_address;
            adminData.tel = response.data.tel;
            adminData.email = response.data.email;
        }
    } catch (error) {
        console.error('내 정보 조회 실패:', error); // 에러가 나면 개발자 도구 창에 기록합니다.
    }
};

// 페이지가 화면에 처음 나타날 때 자동으로 서버에서 정보를 불러옵니다.
onMounted(fetchAdminInfo);

// 비밀번호 변경을 위해 입력받는 전용 칸들입니다.
const passwordForm = reactive({
    currentPassword: '', // 지금 사용 중인 비밀번호
    newPassword: '', // 새로 바꿀 비밀번호
    confirmPassword: '' // 새 비밀번호가 맞는지 한 번 더 확인하는 칸
});

// 3. [수정하기] 버튼을 눌렀을 때 실행되는 함수입니다.
const toggleEditMode = () => {
    // 현재 데이터를 복사해서 따로 보관해둡니다 (취소할 때를 대비해서요).
    originalData = JSON.parse(JSON.stringify(adminData));
    isEditMode.value = true; // 화면을 '수정 모드'로 바꿉니다.
};

// [취소] 버튼을 눌렀을 때 실행되는 함수입니다.
const handleCancel = () => {
    // 입력 중이던 비밀번호 칸들을 모두 깨끗하게 비웁니다.
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';

    isEditMode.value = false; // 다시 '보기 모드'로 돌아갑니다.
    fetchAdminInfo(); // 수정한 내용이 저장되지 않도록 서버에서 다시 데이터를 불러와서 채웁니다.
};

// [저장] 버튼을 눌렀을 때 실행되는 핵심 함수입니다.
const handleSave = async () => {
    // 1단계: 현재 비밀번호를 입력했는지 확인합니다. (본인 확인용)
    if (!passwordForm.currentPassword) {
        alert('본인 확인을 위해 현재 비밀번호를 입력해 주세요.');
        return; // 입력을 안 했다면 여기서 멈춥니다.
    }

    // 2단계: 새 비밀번호를 바꾸려 할 때, 두 번 입력한 값이 똑같은지 검사합니다.
    if (passwordForm.newPassword && passwordForm.newPassword !== passwordForm.confirmPassword) {
        alert('새 비밀번호가 일치하지 않습니다.');
        return; // 서로 다르면 여기서 멈춥니다.
    }

    // 3단계: 사용자에게 정말로 수정할 건지 한 번 더 물어봅니다.
    if (!confirm('정보를 수정하시겠습니까?')) return;

    try {
        // 4단계: 수정한 정보와 비밀번호 정보들을 묶어서 서버로 보냅니다.
        const response = await axios.put('/api/admypage/update', {
            ...adminData, // 기존 관리자 정보들
            ...passwordForm // 입력한 비밀번호들
        });

        // 서버에서 성공적으로 처리했다는 신호를 보내주면
        if (response.data.success) {
            alert('수정되었습니다.');

            // 다음에 다시 수정할 때를 대비해 비밀번호 입력창을 초기화합니다.
            passwordForm.currentPassword = '';
            passwordForm.newPassword = '';
            passwordForm.confirmPassword = '';

            isEditMode.value = false; // 수정을 마쳤으니 다시 '보기 모드'로 돌아갑니다.
            await fetchAdminInfo(); // 바뀐 정보가 화면에 바로 나타나도록 다시 한 번 불러옵니다.
        } else {
            // 서버에서 실패했다고 하면 그 이유(메시지)를 띄워줍니다.
            alert(response.data.message);
        }
    } catch (error) {
        console.error('수정 실패:', error); // 네트워크 오류 등이 나면 기록합니다.
    }
};
</script>

<template>
    <div class="member-info-wrapper">
        <form @submit.prevent="handleSave">
            <div class="card mb-6">
                <div class="section-header">
                    <h3 class="text-xl font-bold">기관관리자 정보</h3>
                    <div>
                        <button v-if="isEditMode" type="button" @click="handleCancel" class="p-button p-button-outlined p-button-secondary p-button-sm mr-2">취소하기</button>
                        <button v-if="!isEditMode" type="button" @click="toggleEditMode" class="p-button p-button-outlined p-button-sm p-button-success">수정하기</button>
                        <button v-else type="submit" class="p-button p-button-primary p-button-sm">저장하기</button>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="info-item">
                        <label class="block text-sm font-semibold mb-2">관리자명</label>
                        <input v-model="adminData.user_name" type="text" class="p-inputtext w-full" :disabled="!isEditMode" />
                    </div>
                    <div class="info-item">
                        <label class="block text-sm font-semibold mb-2">아이디</label>
                        <input :value="adminData.user_id" type="text" class="p-inputtext w-full opacity-70" disabled autocomplete="username" />
                    </div>
                    <div class="info-item">
                        <label class="block text-sm font-semibold mb-2">기관명</label>
                        <input v-model="adminData.agency_name" type="text" class="p-inputtext w-full" :disabled="!isEditMode" />
                    </div>

                    <div class="info-item lg:col-span-3">
                        <label class="block text-sm font-semibold mb-2">주소</label>
                        <div class="flex gap-2 mb-2">
                            <input v-model="adminData.zip_code" type="text" class="p-inputtext w-32" disabled />
                            <button type="button" class="p-button p-button-secondary p-button-sm" :disabled="!isEditMode">우편번호 검색</button>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input v-model="adminData.address" type="text" class="p-inputtext w-full" disabled />
                            <input v-model="adminData.detail_address" type="text" class="p-inputtext w-full" :disabled="!isEditMode" placeholder="상세주소를 입력하세요" />
                        </div>
                    </div>

                    <div class="info-item md:col-span-1 lg:col-span-1">
                        <label class="block text-sm font-semibold mb-2">연락처</label>
                        <input v-model="adminData.tel" type="text" class="p-inputtext w-full" :disabled="!isEditMode" />
                    </div>
                    <div class="info-item md:col-span-1 lg:col-span-2">
                        <label class="block text-sm font-semibold mb-2">이메일</label>
                        <input v-model="adminData.email" type="text" class="p-inputtext w-full" :disabled="!isEditMode" />
                    </div>
                </div>
            </div>

            <div v-if="isEditMode" class="card shadow-lg border-blue-50">
                <div class="section-header border-blue-100">
                    <h3 class="text-xl font-bold text-blue-600">비밀번호 변경</h3>
                </div>

                <input type="text" :value="adminData.user_id" style="display: none" name="username" autocomplete="username" />

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="info-item">
                        <label class="block text-sm font-semibold mb-2 text-red-500">현재 비밀번호 *</label>
                        <input v-model="passwordForm.currentPassword" type="password" class="p-inputtext w-full border-red-200" placeholder="기존 비밀번호 입력" autocomplete="current-password" />
                    </div>
                    <div class="info-item">
                        <label class="block text-sm font-semibold mb-2">새 비밀번호</label>
                        <input v-model="passwordForm.newPassword" type="password" class="p-inputtext w-full" placeholder="새 비밀번호" autocomplete="new-password" />
                    </div>
                    <div class="info-item">
                        <label class="block text-sm font-semibold mb-2">새 비밀번호 확인</label>
                        <input v-model="passwordForm.confirmPassword" type="password" class="p-inputtext w-full" placeholder="비밀번호 재입력" autocomplete="new-password" />
                    </div>
                </div>
                <p class="mt-4 text-xs text-gray-400">※ 본인 확인을 위해 현재 비밀번호를 입력해야 저장이 가능합니다.</p>
            </div>
        </form>
    </div>
</template>

<style scoped>
/* 기존 스타일 유지하면서 레이아웃 디테일 수정 */
.member-info-wrapper {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.card {
    background: white !important;
    border-radius: 16px !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05) !important;
    padding: 2.5rem !important; /* 내부 여백 조금 더 확보 */
    border: 1px solid #f1f5f9 !important;
    margin-bottom: 2rem;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1.25rem;
    border-bottom: 2px solid #f8fafc;
    margin-bottom: 2rem;
}

.p-inputtext {
    padding: 0.85rem;
    border-radius: 8px;
    background-color: #f8fafc !important;
    border: 1px solid #e2e8f0;
    font-size: 0.95rem;
}

.p-inputtext:disabled {
    background-color: #f1f5f9 !important;
    color: #94a3b8;
}

/* 주소 입력창 가로 정렬 보정 */
.info-item.lg:col-span-3 .grid {
    margin-top: 0.5rem;
}

label {
    color: #475569;
}
</style>
