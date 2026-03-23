<template>
    <div class="page-wrapper p-fluid">
        <div class="signup-container">
            <div class="gradient-border">
                <div class="signup-card shadow-4">
                    <div class="text-center mb-5">
                        <div class="text-primary text-3xl font-bold mb-3">회원가입</div>
                        <span class="text-600 font-medium">유형을 선택하고 정보를 입력해주세요</span>
                    </div>

                    <div class="flex justify-content-center gap-4 mb-5 p-3 surface-100 border-round-xl">
                        <div class="flex align-items-center">
                            <RadioButton v-model="form.userType" inputId="type1" name="userType" value="user" />
                            <label for="type1" class="ml-2 font-bold cursor-pointer">일반 이용자</label>
                        </div>
                        <div class="flex align-items-center">
                            <RadioButton v-model="form.userType" inputId="type2" name="userType" value="agency" />
                            <label for="type2" class="ml-2 font-bold cursor-pointer">기관 담당자</label>
                        </div>
                    </div>

                    <form @submit.prevent="submit">
                        <div class="field mb-4">
                            <label for="name" class="block text-900 font-semibold mb-2">이름</label>
                            <InputText id="name" v-model="form.name" placeholder="실명을 입력하세요" class="p-3" />
                        </div>

                        <div class="field mb-4">
                            <label for="userId" class="block text-900 font-semibold mb-2">아이디</label>
                            <div class="flex gap-2">
                                <InputText id="userId" v-model="form.userId" placeholder="아이디 입력" class="p-3 flex-1" />
                                <Button label="중복확인" @click="checkId" class="p-button-outlined w-auto px-4" />
                            </div>
                        </div>

                        <div class="field mb-4">
                            <label for="password" class="block text-900 font-semibold mb-2">비밀번호</label>
                            <Password id="password" v-model="form.password" placeholder="비밀번호 입력" :toggleMask="true" class="w-full" inputClass="p-3 w-full" />
                        </div>

                        <div class="field mb-4">
                            <label for="passwordConfirm" class="block text-900 font-semibold mb-2">비밀번호 확인</label>
                            <Password id="passwordConfirm" v-model="form.passwordConfirm" placeholder="비밀번호 재입력" :toggleMask="true" :feedback="false" class="w-full" inputClass="p-3 w-full" />
                        </div>

                        <div class="field mb-4">
                            <label class="block text-900 font-semibold mb-2">주소</label>
                            <div class="flex gap-2 mb-2">
                                <InputText v-model="form.zipcode" placeholder="우편번호" class="p-3 flex-1" readonly />
                                <Button label="우편번호 검색" @click="searchAddress" class="p-button-secondary w-auto px-3" />
                            </div>
                            <InputText v-model="form.address" placeholder="기본 주소" class="p-3 mb-2" readonly />
                            <InputText v-model="form.detailAddress" placeholder="상세 주소를 입력하세요" class="p-3" />
                        </div>

                        <div class="field mb-4">
                            <label class="block text-900 font-semibold mb-2">소속 기관 선택</label>
                            <div class="flex gap-2">
                                <Select v-model="form.region" :options="['서울', '대구']" placeholder="지역 선택" class="flex-1" />
                                <Select v-model="form.organization" :options="['기관 A', '기관 B']" placeholder="기관 선택" class="flex-1" />
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div class="field">
                                <label for="phone" class="block text-900 font-semibold mb-2">전화번호</label>
                                <InputText id="phone" v-model="form.phone" placeholder="010-0000-0000" class="p-3" />
                            </div>
                            <div class="field">
                                <label for="email" class="block text-900 font-semibold mb-2">이메일</label>
                                <InputText id="email" v-model="form.email" placeholder="email@email.com" class="p-3" />
                            </div>
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
<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
// PrimeVue 컴포넌트 임포트
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Select from 'primevue/select'; // PrimeVue v4 기준 (구 Dropdown)
import RadioButton from 'primevue/radiobutton';

const router = useRouter();

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

const checkId = () => {
    console.log('아이디 체크:', form.userId);
};

const searchAddress = () => {
    new window.daum.Postcode({
        oncomplete: (data) => {
            try {
                // 1. 데이터 추출
                const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
                const extraAddr = data.bname !== '' ? ` (${data.bname})` : '';

                // 2. Vue form 객체에 값 넣기 (변수명이 정확한지 꼭 확인!)
                form.zipcode = data.zonecode;
                form.address = addr + extraAddr;

                // 3. 상세주소 포커스 (에러 방지를 위해 옵셔널 체이닝 ?. 사용)
                setTimeout(() => {
                    document.getElementById('detailAddress')?.focus();
                }, 100);
            } catch (error) {
                console.error('주소 선택 중 오류 발생:', error);
            }

            // oncomplete가 끝나면 카카오 라이브러리가 보통 알아서 닫지만,
            // 명시적으로 닫히지 않는다면 위 로직의 에러 여부를 F12 콘솔에서 확인해야 합니다.
        }
    }).open();
};

const submit = async () => {
    if (form.password !== form.passwordConfirm) {
        alert('비밀번호가 다릅니다. 다시 확인해주세요');
        return;
    }

    // [수정] 데이터 전송 경로 분기 처리
    const endpoint = form.userType === 'user' ? '/api/signup/user' : '/api/signup/agency';

    try {
        const response = await axios.post('http://localhost:3000/info/signup', form);
        alert(response.data.message);
        router.push('/login');
    } catch (error) {
        alert('가입 처리 중 오류가 발생했습니다.');
    }
};
</script>
<style scoped>
.page-wrapper {
    background-color: #f8fafc;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
}

.signup-container {
    width: 100%;
    max-width: 600px; /* 로그인보다 조금 더 넓게 설정 */
}

.gradient-border {
    padding: 3px;
    border-radius: 30px;
    background: linear-gradient(180deg, var(--primary-color, #6366f1) 0%, rgba(99, 102, 241, 0) 100%);
}

.signup-card {
    background: #ffffff;
    padding: 3rem 2.5rem;
    border-radius: 28px;
}

.field label {
    display: block;
}

/* PrimeVue Select 너비 조정 */
:deep(.p-select) {
    width: 100%;
}
.surface-100 {
    background-color: #f1f5f9;
}
</style>
