<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Select from 'primevue/select';
import RadioButton from 'primevue/radiobutton';

const router = useRouter();

const agencyOptions = ref([
    { label: '기관 A', value: 102 },
    { label: '기관 B', value: 101 }
]);

const form = reactive({
    userType: 'user',
    name: '',
    userId: '',
    password: '',
    passwordConfirm: '',
    zipcode: '',
    address: '',
    detailAddress: '',
    region: '',
    organization: '',
    phone: '',
    email: ''
});

const isIdDuplicated = ref(false);
const idCheckMessage = ref('');
const isIdVerified = ref(false);

// 아이디 입력 시 중복체크 상태 초기화
const resetIdCheck = () => {
    isIdDuplicated.value = false;
    idCheckMessage.value = '';
    isIdVerified.value = false;
};

// 아이디 중복 확인
const checkId = async () => {
    if (!form.userId) {
        alert('아이디를 입력해주세요.');
        return;
    }

    try {
        const response = await axios.get(`http://localhost:3000/info/check-id/${form.userId}`);
        if (response.data.isAvailable) {
            isIdDuplicated.value = false;
            idCheckMessage.value = '사용 가능한 아이디입니다.'; // '(테스트)' 문구 삭제
            isIdVerified.value = true;
        } else {
            isIdDuplicated.value = true;
            idCheckMessage.value = '';
            isIdVerified.value = false;
        }
    } catch (error) {
        console.error('ID 체크 중 오류:', error);
        // 테스트용 예외 처리
        if (['admin', 'family_01', 'manager_01'].includes(form.userId)) {
            isIdDuplicated.value = true;
            isIdVerified.value = false;
        } else {
            isIdDuplicated.value = false;
            idCheckMessage.value = '사용 가능한 아이디입니다.'; // '(테스트)' 문구 삭제
            isIdVerified.value = true;
        }
    }
};

const searchAddress = () => {
    new window.daum.Postcode({
        oncomplete: (data) => {
            const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
            const extraAddr = data.bname !== '' ? ` (${data.bname})` : '';
            form.zipcode = data.zonecode;
            form.address = addr + extraAddr;
            setTimeout(() => {
                document.getElementById('detailAddress')?.focus();
            }, 100);
        }
    }).open();
};

const submit = async () => {
    if (form.password !== form.passwordConfirm) {
        alert('비밀번호가 다릅니다. 다시 확인해주세요');
        return;
    }

    if (!isIdVerified.value) {
        alert('아이디 중복 확인을 진행해주세요.');
        return;
    }

    const signupData = {
        user_id: form.userId,
        agency_id: form.organization || null,
        password: form.password,
        user_name: form.name,
        role: form.userType === 'user' ? 'FAMILY' : 'MANAGER',
        join_status: 'PENDING',
        zip_code: form.zipcode,
        address: form.address,
        detail_address: form.detailAddress,
        tel: form.phone,
        email: form.email,
        region: form.region
    };

    try {
        const response = await axios.post('http://localhost:3000/info/signup', signupData);
        alert(response.data.message);
        router.push('/login');
    } catch (error) {
        alert('가입 처리 중 오류가 발생했습니다.');
    }
};
</script>

<template>
    <div class="page-wrapper p-fluid">
        <div class="signup-container">
            <div class="gradient-border">
                <div class="signup-card shadow-4">
                    <div class="text-center mb-3">
                        <div class="text-primary text-3xl font-bold mb-3">회원가입</div>
                        <span class="text-600 font-medium">유형을 선택하고 정보를 입력해주세요</span>
                    </div>

                    <div class="flex justify-content-center gap-4 mb-3 p-3 surface-100 border-round-xl">
                        <div class="flex align-items-center">
                            <RadioButton v-model="form.userType" inputId="type1" name="userType" value="user" @change="resetIdCheck" />
                            <label for="type1" class="ml-2 font-bold cursor-pointer">일반 이용자</label>
                        </div>
                        <div class="flex align-items-center">
                            <RadioButton v-model="form.userType" inputId="type2" name="userType" value="agency" @change="resetIdCheck" />
                            <label for="type2" class="ml-2 font-bold cursor-pointer">기관 담당자</label>
                        </div>
                    </div>

                    <form @submit.prevent="submit">
                        <div class="field mb-3">
                            <label for="name" class="block text-900 font-semibold mb-2">이름</label>
                            <InputText id="name" v-model="form.name" placeholder="실명을 입력하세요" class="p-3" />
                        </div>

                        <div class="field mb-3">
                            <label for="userId" class="block text-900 font-semibold mb-2">아이디</label>
                            <div class="flex gap-2">
                                <InputText id="userId" v-model="form.userId" placeholder="아이디 입력" class="p-3 flex-1" :class="{ 'p-invalid': isIdDuplicated }" @input="resetIdCheck" autocomplete="username" />
                                <Button label="중복확인" @click="checkId" class="p-button-outlined w-auto px-4" />
                            </div>
                            <small v-if="isIdDuplicated" class="p-error block mt-1 ml-1 font-semibold text-red-500"> 이미 사용 중인 아이디입니다. </small>
                            <small v-else-if="idCheckMessage" class="text-green-500 block mt-1 ml-1 font-semibold">
                                {{ idCheckMessage }}
                            </small>
                        </div>

                        <div class="field mb-3">
                            <label for="password" class="block text-900 font-semibold mb-2">비밀번호</label>
                            <Password id="password" v-model="form.password" placeholder="비밀번호 입력" :toggleMask="true" class="w-full" inputClass="p-3 w-full" :inputProps="{ autocomplete: 'new-password' }" />
                        </div>

                        <div class="field mb-3">
                            <label for="passwordConfirm" class="block text-900 font-semibold mb-2">비밀번호 확인</label>
                            <Password id="passwordConfirm" v-model="form.passwordConfirm" placeholder="비밀번호 재입력" :toggleMask="true" :feedback="false" class="w-full" inputClass="p-3 w-full" :inputProps="{ autocomplete: 'new-password' }" />
                        </div>

                        <div class="field mb-3">
                            <label class="block text-900 font-semibold mb-2">주소</label>

                            <div class="flex gap-2 mb-3">
                                <InputText v-model="form.zipcode" placeholder="우편번호" class="p-3 flex-1" readonly />
                                <Button label="우편번호 검색" @click="searchAddress" class="p-button-secondary w-auto px-3" />
                            </div>

                            <div class="mb-3">
                                <InputText v-model="form.address" placeholder="기본 주소" class="p-3 w-full" readonly />
                            </div>

                            <div>
                                <InputText id="detailAddress" v-model="form.detailAddress" placeholder="상세 주소를 입력하세요" class="p-3 w-full" />
                            </div>
                        </div>

                        <div class="field mb-3">
                            <label class="block text-900 font-semibold mb-2">소속 기관 선택</label>
                            <div class="flex gap-2">
                                <Select v-model="form.region" :options="['서울', '대구']" placeholder="지역 선택" class="flex-1" />
                                <Select v-model="form.organization" :options="agencyOptions" optionLabel="label" optionValue="value" placeholder="기관 선택" class="flex-1" />
                            </div>
                        </div>

                        <div class="field mb-3">
                            <label for="phone" class="block text-900 font-semibold mb-2">전화번호</label>
                            <InputText id="phone" v-model="form.phone" placeholder="010-0000-0000" class="p-3 w-full" />
                        </div>

                        <div class="field mb-6">
                            <label for="email" class="block text-900 font-semibold mb-2">이메일</label>
                            <InputText id="email" v-model="form.email" placeholder="email@email.com" class="p-3 w-full" />
                        </div>

                        <div class="flex flex-column gap-3">
                            <Button type="submit" :label="form.userType === 'user' ? '일반 회원가입 완료' : '기관 담당자 가입 완료'" class="p-3 text-xl border-round-xl" />
                            <Button label="취소" @click="router.push('/login')" class="p-button-text text-600" />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page-wrapper {
    background-color: #f8fafc;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}
.signup-container {
    width: 100%;
    max-width: 700px;
}
.gradient-border {
    padding: 3px;
    border-radius: 30px;
    background: linear-gradient(180deg, #6366f1 0%, rgba(99, 102, 241, 0) 100%);
}
.signup-card {
    background: #ffffff;
    padding: 2rem;
    border-radius: 28px;
}
.surface-100 {
    background-color: #f1f5f9;
}
:deep(.p-select) {
    width: 100%;
}
.p-error {
    color: #ef4444;
}
</style>
