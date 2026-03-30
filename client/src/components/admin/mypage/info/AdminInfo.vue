<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import axios from 'axios';

const authStore = useAuthStore();
const { userId } = storeToRefs(authStore);

// 1. 상태 관리
const isEditMode = ref(false); // 수정 모드 여부

// 2. 데이터 (초기값은 API 호출로 채워진다고 가정)
const adminData = reactive({
    name: '김마마',
    id: userId.value || 'syougaisennta123',
    orgName: '발달장애인 담당 센터',
    zipCode: '42513',
    address: '대구광역시 수성구 중앙로 1864',
    addressDetail: '101동 1002호',
    phone: '010-4444-3333',
    email: 'syougaisenta@naver.com'
});

onMounted(async () => {
    if (userId.value) {
        try {
            // 현재 로그인한 userId를 파라미터로 서버에 정보 요청
            const response = await axios.get(`/api/admin/info/${userId.value}`);

            if (response.data) {
                // 서버에서 받은 데이터로 adminData 객체 업데이트
                Object.assign(adminData, response.data);
            }
        } catch (error) {
            console.error('관리자 정보를 불러오는 중 오류 발생:', error);
            alert('정보를 불러오지 못했습니다.');
        }
    }
});

// 비밀번호 폼
const passwordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

// 3. 기능: 수정 모드 전환
const toggleEditMode = () => {
    isEditMode.value = true;
};

// 4. 기능: 저장 (비밀번호 검증 포함)
const handleSave = () => {
    // 새 비밀번호 입력 시 일치 여부 확인 (특이사항 3번)
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
        return;
    }

    // 실제로는 여기서 axios.post로 DB 비밀번호 일치 여부(특이사항 4번)를 체크해야 합니다.
    if (confirm('정보를 수정하시겠습니까?')) {
        alert('성공적으로 저장되었습니다.');
        isEditMode.value = false;
        // 비밀번호 필드 초기화
        passwordForm.currentPassword = '';
        passwordForm.newPassword = '';
        passwordForm.confirmPassword = '';
    }
};
</script>

<template>
    <div class="member-info-wrapper">
        <div class="card mb-6">
            <div class="section-header">
                <h3 class="text-xl font-bold">기관관리자 정보</h3>
                <div>
                    <button v-if="!isEditMode" @click="toggleEditMode" class="p-button p-button-outlined p-button-sm p-button-success">수정하기</button>
                    <button v-else @click="handleSave" class="p-button p-button-primary p-button-sm">저장하기</button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="info-item">
                    <label class="block text-sm font-semibold mb-2">관리자명</label>
                    <input v-model="adminData.name" type="text" class="p-inputtext w-full" :disabled="!isEditMode" />
                </div>
                <div class="info-item">
                    <label class="block text-sm font-semibold mb-2">아이디</label>
                    <input :value="adminData.id" type="text" class="p-inputtext w-full opacity-70" disabled />
                </div>
                <div class="info-item">
                    <label class="block text-sm font-semibold mb-2">기관명</label>
                    <input v-model="adminData.orgName" type="text" class="p-inputtext w-full" :disabled="!isEditMode" />
                </div>

                <div class="info-item lg:col-span-3">
                    <label class="block text-sm font-semibold mb-2">주소</label>
                    <div class="flex gap-2 mb-2">
                        <input v-model="adminData.zipCode" type="text" class="p-inputtext w-32" disabled />
                        <button class="p-button p-button-secondary p-button-sm" :disabled="!isEditMode">우편번호 검색</button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input v-model="adminData.address" type="text" class="p-inputtext w-full" disabled />
                        <input v-model="adminData.addressDetail" type="text" class="p-inputtext w-full" :disabled="!isEditMode" placeholder="상세주소를 입력하세요" />
                    </div>
                </div>

                <div class="info-item md:col-span-1 lg:col-span-1">
                    <label class="block text-sm font-semibold mb-2">연락처</label>
                    <input v-model="adminData.phone" type="text" class="p-inputtext w-full" :disabled="!isEditMode" />
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
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="info-item">
                    <label class="block text-sm font-semibold mb-2 text-red-500">현재 비밀번호 *</label>
                    <input v-model="passwordForm.currentPassword" type="password" class="p-inputtext w-full border-red-200" placeholder="기존 비밀번호 입력" />
                </div>
                <div class="info-item">
                    <label class="block text-sm font-semibold mb-2">새 비밀번호</label>
                    <input v-model="passwordForm.newPassword" type="password" class="p-inputtext w-full" placeholder="새 비밀번호" />
                </div>
                <div class="info-item">
                    <label class="block text-sm font-semibold mb-2">새 비밀번호 확인</label>
                    <input v-model="passwordForm.confirmPassword" type="password" class="p-inputtext w-full" placeholder="비밀번호 재입력" />
                </div>
            </div>
            <p class="mt-4 text-xs text-gray-400">※ 본인 확인을 위해 현재 비밀번호를 입력해야 저장이 가능합니다.</p>
        </div>
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
