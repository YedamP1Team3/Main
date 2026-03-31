<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import axios from 'axios';

const authStore = useAuthStore();
const { userId } = storeToRefs(authStore);

// 1. 상태 관리
const isEditMode = ref(false); // 수정 모드 여부
let originalData = {}; // 수정 전 데이터를 보관할 임시 객체

// 2. 데이터 (초기값은 API 호출로 채워진다고 가정)
const adminData = reactive({
    user_name: '', // name -> user_name (DB 기준)
    user_id: '', // id -> user_id
    agency_name: '', // orgName -> agency_name (JOIN 쿼리 결과)
    zip_code: '', // zipCode -> zip_code
    address: '',
    detail_address: '', // addressDetail -> detail_address
    tel: '', // phone -> tel
    email: ''
});

const fetchAdminInfo = async () => {
    try {
        const response = await axios.get(`/api/admypage/${userId.value}`);
        console.log('서버 응답 확인:', response.data); // 여기서 컬럼명 확인

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
        console.error('내 정보 조회 실패:', error);
    }
};

onMounted(fetchAdminInfo);

// 비밀번호 폼
const passwordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

// 3. 기능: 수정 모드 전환
const toggleEditMode = () => {
    originalData = JSON.parse(JSON.stringify(adminData));
    isEditMode.value = true;
};

// 취소 버튼 클릭 시
const handleCancel = () => {
    // 비밀번호 필드 초기화
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';

    isEditMode.value = false;
    fetchAdminInfo(); // 수정한 내용을 원래대로 되돌리기 위해 다시 조회
};

// 4. 기능: 저장 (비밀번호 검증 포함)
const handleSave = async () => {
    console.log('보내는 데이터 전체:', adminData); // user_id가 있는지 확인
    console.log('입력한 현재 비번:', passwordForm.currentPassword);
    if (!passwordForm.currentPassword) {
        alert('본인 확인을 위해 현재 비밀번호를 입력해 주세요.');
        return;
    }

    if (passwordForm.newPassword && passwordForm.newPassword !== passwordForm.confirmPassword) {
        alert('새 비밀번호가 일치하지 않습니다.');
        return;
    }

    if (!confirm('정보를 수정하시겠습니까?')) return;

    try {
        // 백엔드 API 호출
        const response = await axios.put('/api/admypage/update', {
            ...adminData,
            ...passwordForm
        });

        if (response.data.success) {
            alert('수정되었습니다.');

            // 비밀번호 입력 필드 초기화(수정하고 나왔을때 다시 들어가면 값이 남아있었음)
            passwordForm.currentPassword = '';
            passwordForm.newPassword = '';
            passwordForm.confirmPassword = '';

            // 수정 모드 종료
            isEditMode.value = false;

            // 최신 데이터로 다시 조회
            await fetchAdminInfo();
        } else {
            alert(response.data.message);
        }
    } catch (error) {
        console.error('수정 실패:', error);
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
