<script setup>
import { onMounted, reactive, ref, watch } from 'vue'; // 데이터 상태를 관리하기 위한 도구들을 가져옵니다.
import { useRouter } from 'vue-router'; // 가입 성공 후 로그인 페이지로 보내주기 위해 사용합니다.
import axios from 'axios'; // 서버에 회원가입 정보를 전송하기 위한 통신 도구입니다.

// 화면을 예쁘게 구성할 PrimeVue의 입력창과 버튼들을 가져옵니다.
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Select from 'primevue/select';
import RadioButton from 'primevue/radiobutton';

const router = useRouter(); // 페이지 이동 함수를 준비합니다.

// 빈 배열로 초기화
const agencyOptions = ref([]);
const agencyCityOptions = ref([]);

// 1. [지역 목록] - 페이지 로드시나 초기화 시 호출 (파라미터 필요 없음)
const fetchAgenciesCity = async () => {
    try {
        const response = await axios.get('/api/info/agencies/city');
        // 보통 지역 목록은 { label, value } 형태의 배열로 저장합니다.
        agencyCityOptions.value = response.data;
    } catch (error) {
        console.error('지역 목록 로드 실패:', error);
    }
};

// 2. [기관 목록] - 지역(region)이 변경될 때마다 호출
const fetchAgencies = async () => {
    // 지역을 다시 '선택 안 함'으로 바꿨을 때 처리
    if (!form.region) {
        agencyOptions.value = [];
        form.organization = null; // 기존 선택값 초기화
        return;
    }

    try {
        const response = await axios.get('/api/info/agencies', {
            params: { region: form.region }
        });

        agencyOptions.value = response.data;

        if (agencyOptions.value.length === 0) {
            agencyOptions.value = [{ label: '해당 지역에 기관이 없습니다.', value: null }];
        }
    } catch (error) {
        console.error('기관 목록 로드 실패:', error);
        agencyOptions.value = [{ label: '로드 실패', value: null }];
    }
};

// 1. [회원가입 폼 데이터] 사용자가 입력할 모든 정보를 담는 큰 바구니입니다.
const form = reactive({
    userType: 'user', // 일반 유저인지 담당자인지 구분 (기본값은 일반 유저)
    name: '', // 이름
    userId: '', // 아이디
    password: '', // 비밀번호
    passwordConfirm: '', // 비밀번호 확인용
    zipcode: '', // 우편번호
    address: '', // 주소
    detailAddress: '', // 상세 주소
    region: '', // 지역 (담당자용)
    organization: '', // 소속 기관 (담당자용)
    phone: '', // 전화번호
    email: '' // 이메일
});

// 아이디 중복 체크 상태를 관리하는 변수들입니다.
const isIdDuplicated = ref(false); // 아이디가 중복되었는지 여부
const idCheckMessage = ref(''); // 화면에 보여줄 안내 메시지
const isIdVerified = ref(false); // 중복 체크를 통과했는지 여부

// 아이디를 다시 입력하기 시작하면 중복 체크 상태를 초기화합니다. (다시 검사하게 유도)
const resetIdCheck = () => {
    isIdDuplicated.value = false;
    idCheckMessage.value = '';
    isIdVerified.value = false;
};

// 2. [아이디 중복 확인] 서버에 이 아이디를 써도 되는지 물어봅니다.
const checkId = async () => {
    if (!form.userId) {
        alert('아이디를 입력해주세요.');
        return;
    }

    try {
        // 서버의 중복 체크 API(/api/info/check-id/아이디)를 호출합니다.
        const response = await axios.get(`/api/info/check-id/${form.userId}`);
        if (response.data.isAvailable) {
            // 사용 가능한 경우
            isIdDuplicated.value = false;
            idCheckMessage.value = '사용 가능한 아이디입니다.';
            isIdVerified.value = true; // '확인 완료' 상태로 변경
        } else {
            // 이미 누가 쓰고 있는 경우
            isIdDuplicated.value = true;
            idCheckMessage.value = '';
            isIdVerified.value = false;
        }
    } catch (error) {
        console.error('ID 체크 중 오류:', error);
        // 서버가 꺼져있을 때를 대비한 테스트용 로직입니다.
        if (['admin', 'family_01', 'manager_01'].includes(form.userId)) {
            isIdDuplicated.value = true;
            isIdVerified.value = false;
        } else {
            isIdDuplicated.value = false;
            idCheckMessage.value = '사용 가능한 아이디입니다.';
            isIdVerified.value = true;
        }
    }
};

// 3. [주소 검색] 카카오(Daum) 주소 API창을 띄웁니다.
const searchAddress = () => {
    new window.daum.Postcode({
        oncomplete: (data) => {
            // 도로명 주소와 지번 주소 중 사용자가 선택한 것을 가져옵니다.
            const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
            const extraAddr = data.bname !== '' ? ` (${data.bname})` : '';
            form.zipcode = data.zonecode; // 우편번호 저장
            form.address = addr + extraAddr; // 기본 주소 저장
            // 상세 주소 칸으로 자동으로 커서를 옮겨줍니다.
            setTimeout(() => {
                document.getElementById('detailAddress')?.focus();
            }, 100);
        }
    }).open();
};

// 4. [가입하기] 최종 버튼을 눌렀을 때 실행됩니다.
const submit = async () => {
    if (!form.name || !form.userId || !form.password || !form.passwordConfirm || !form.phone || !form.address) {
        alert('이름, 아이디, 비밀번호, 비밀번호확인 ,전화번호, 주소는 필수 입력 사항입니다');
        return;
    }

    if (form.userType === 'agency') {
        if (!form.region || !form.organization) {
            alert('기관 담당자는 지역과 소속 기관을 반드시 선택해야 합니다.');
            return;
        }
    }

    // [검사 1] 비밀번호와 비밀번호 확인이 똑같은지 확인합니다.
    if (form.password !== form.passwordConfirm) {
        alert('비밀번호가 다릅니다. 다시 확인해주세요');
        return;
    }

    // [검사 2] 아이디 중복 확인 버튼을 눌렀었는지 확인합니다.
    if (!isIdVerified.value) {
        alert('아이디 중복 확인을 진행해주세요.');
        return;
    }

    // [데이터 정리] DB 컬럼명에 맞춰서 예쁘게 데이터를 포장합니다.
    const signupData = {
        user_id: form.userId,
        agency_id: form.organization || null, // 기관이 없으면 빈 값(null)을 보냅니다.
        password: form.password,
        user_name: form.name,
        role: form.userType === 'user' ? 'FAMILY' : 'MANAGER', // 유저 타입에 따라 역할을 정합니다.
        join_status: 'PENDING', // 가입 승인 대기 상태로 설정합니다.
        zip_code: form.zipcode,
        address: form.address,
        detail_address: form.detailAddress,
        tel: form.phone,
        email: form.email,
        region: form.region
    };

    try {
        // 서버의 가입 API(/api/info/signup)로 데이터를 전송합니다.
        const response = await axios.post('/api/info/signup', signupData);
        alert(response.data.message); // 가입 축하 메시지를 띄웁니다.
        router.push('/login'); // 로그인 페이지로 이동시킵니다.
    } catch (error) {
        alert('가입 처리 중 오류가 발생했습니다.');
    }
};

watch(
    () => form.region,
    (newRegion) => {
        // 지역이 변경되면 기관 선택값은 무조건 초기화
        form.organization = '';
        if (newRegion) {
            fetchAgencies();
        } else {
            agencyOptions.value = [];
        }
    }
);

onMounted(() => {
    fetchAgenciesCity();
});
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
                                <Select v-model="form.region" :options="agencyCityOptions" optionLabel="label" optionValue="value" placeholder="지역 선택" class="flex-1" />
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
/* 1. 페이지 배경 이미지 설정 (로그인과 동일하게 맞춤) */
.page-wrapper {
    /* 로그인 페이지와 같은 사진 주소를 넣어주세요 */
    background-image: url('./img/회원가입2.jpg');
    background-size: cover;
    background-position: center;
    background-attachment: fixed; /* 스크롤할 때 배경이 고정되어 더 예쁩니다 */
    background-repeat: no-repeat;

    box-shadow: inset 0 0 0 2000px rgba(254, 249, 246, 0.3);

    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px; /* 세로로 긴 폼이므로 상하 여백을 조금 더 줍니다 */
}

/* 2. 회원가입 카드 너비 설정 */
.signup-container {
    width: 100%;
    max-width: 650px; /* 로그인창보다 살짝 넓게 */
}

/* 3. 코랄 웜톤 그라데이션 테두리 */
.gradient-border {
    padding: 3px;
    border-radius: 30px;
    background: linear-gradient(180deg, rgba(255, 171, 145, 0.9) 0%, rgba(255, 255, 255, 0) 40%);
}

/* 4. 글래스모피즘 (반투명 유리) 회원가입 카드 */
.signup-card {
    /* 하얀색 반투명 배경 (입력칸이 많아 로그인보다 살짝 더 불투명하게 0.8 설정) */
    background: rgba(255, 255, 255, 0.8);

    /* 뒷배경 블러 처리 */
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);

    /* 유리 표면 빛 반사 테두리 */
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-top: 1px solid rgba(255, 255, 255, 0.9);

    /* 부드러운 그림자 */
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);

    padding: 2.5rem 2rem;
    border-radius: 28px;
}

/* 5. 내부 요소 스타일 디테일 */
.surface-100 {
    /* 라디오 버튼 묶음 배경을 조금 더 투명하고 따뜻하게 */
    background-color: rgba(254, 249, 246, 0.7);
    border: 1px solid #f4e2de;
}

/* PrimeVue Select 컴포넌트 너비 조절 */
:deep(.p-select) {
    width: 100%;
}

/* 에러 메시지 텍스트 */
.p-error {
    color: #ef4444;
}

/* 제목 텍스트 (text-primary 속성 덮어쓰기) */
.text-primary {
    color: #ffab91 !important;
}

/* 입력창 포커스 시 테두리 색상 웜톤으로 변경 */
:deep(.p-inputtext:enabled:focus),
:deep(.p-password-input:enabled:focus) {
    border-color: #ffab91 !important;
    box-shadow: 0 0 0 0.2rem rgba(255, 171, 145, 0.2) !important;
}
</style>
