<script setup>
import { reactive } from 'vue'; // 여러 데이터를 하나로 묶어 관리하기 위해 가져옵니다.
import { useRouter } from 'vue-router'; // 로그인 성공 후 다른 페이지로 이동시키기 위해 사용합니다.
import axios from 'axios'; // 서버(Node.js)에 로그인 요청을 보내기 위한 도구입니다.
import { useAuthStore } from '@/stores/auth'; // 로그인 상태(이름, 아이디 등)를 앱 전체에 공유하기 위한 저장소입니다.

// PrimeVue 컴포넌트들을 가져옵니다 (화면 UI를 예쁘게 만들어줍니다).
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';

const router = useRouter(); // 페이지 이동을 시켜주는 함수를 준비합니다.
const authStore = useAuthStore(); // 로그인 정보를 저장할 저장소를 사용할 준비를 합니다.

// 1. [입력창 데이터] 사용자가 입력할 아이디와 비밀번호를 담는 바구니입니다.
const form = reactive({
    userId: '',
    password: ''
});

// 2. [로그인 버튼 클릭 시] 실행되는 핵심 로직입니다.
const handleLogin = async () => {
    // [유효성 검사] 빈 칸이 있는지 먼저 확인합니다.
    if (!form.userId || !form.password) {
        alert('아이디와 비밀번호를 모두 입력해주세요.');
        return;
    }

    try {
        // 서버의 로그인 API(/api/info/login)로 아이디와 비번을 실어서 보냅니다.
        const response = await axios.post('/api/info/login', {
            userId: form.userId,
            password: form.password
        });

        // 서버에서 응답(성공 데이터)이 왔다면 처리 시작!
        if (response.data) {
            const user = response.data.user; // 서버가 보내준 유저 정보를 변수에 담습니다.
            authStore.login(user); // Pinia 저장소에 유저 정보를 저장합니다 (로그인 상태 유지).

            // 유저의 역할(ADMIN, FAMILY 등)을 대문자로 바꿔서 비교하기 쉽게 만듭니다.
            const userRole = user.role.toUpperCase();

            // [교통 정리] 역할에 따라 서로 다른 페이지로 보내줍니다.
            if (userRole === 'ADMIN') {
                // 관리자라면? 관리자 메인으로!
                alert(`${user.name}님 환영합니다. 관리자 페이지로 이동합니다.`);
                router.push('/adjoin-family');
            } else if (userRole === 'MANAGER') {
                // 담당자(시설장 등)라면? 담당자 메인으로!
                alert(`${user.name}님 환영합니다. 담당자 페이지로 이동합니다.`);
                router.push('/BeneficiaryMain');
            } else if (userRole === 'FAMILY') {
                // 일반 가족 사용자라면? 신청 페이지로!
                alert(`${user.name}님 환영합니다. 일반 사용자 페이지로 이동합니다.`);
                router.push('/homepage');
            } else if (userRole === 'SYSADMIN') {
                // 일반 가족 사용자라면? 신청 페이지로!
                alert(`${user.name}님 환영합니다. 일반 사용자 페이지로 이동합니다.`);
                router.push('/survey');
            } else {
                // 그 외의 경우 기본 환영 메시지만 띄웁니다.
                alert(`${user.name}님 환영합니다.`);
            }
        }
    } catch (error) {
        // 로그인 실패 시 (비번 틀림 등) 서버가 보내준 에러 메시지를 띄웁니다.
        const errorMsg = error.response?.data?.message || '로그인 중 오류가 발생했습니다.';
        alert(errorMsg);
        console.error('Login Error:', error);
    }
};

// 3. [기타 버튼들] 회원가입이나 아이디 찾기 버튼 클릭 시 이동하는 함수들입니다.
const goToSignUp = () => router.push('/signup'); // 회원가입 페이지로 이동
const findId = () => alert('서비스 준비 중입니다.'); // 준비 중 알림
const findPw = () => alert('서비스 준비 중입니다.'); // 준비 중 알림
</script>

<template>
    <div class="page-wrapper">
        <div class="login-container">
            <div class="gradient-card">
                <div class="login-card">
                    <div class="text-center mb-5">
                        <div class="text-900 text-3xl font-medium mb-3">Welcome!</div>
                        <span class="text-600 font-medium">서비스 이용을 위해 로그인해주세요</span>
                    </div>

                    <form @submit.prevent="handleLogin">
                        <div class="form-group">
                            <label for="userId" class="block text-900 font-medium mb-2">ID</label>
                            <InputText id="userId" v-model="form.userId" placeholder="아이디를 입력하세요" class="w-full p-3" autocomplete="username" />
                        </div>

                        <div class="form-group">
                            <label for="password" class="block text-900 font-medium mb-2">Password</label>
                            <Password id="password" v-model="form.password" placeholder="비밀번호를 입력하세요" :toggleMask="true" :feedback="false" class="w-full" inputClass="w-full p-3" :inputProps="{ autocomplete: 'current-password' }" />
                        </div>

                        <div class="flex justify-content-between mt-2 mb-5 text-sm">
                            <div class="left-links">
                                <span class="text-600 cursor-pointer hover:underline mr-3" @click="findId">아이디 찾기</span>
                                <span class="text-600 cursor-pointer hover:underline" @click="findPw">비밀번호 찾기</span>
                            </div>
                            <div class="right-links">
                                <span class="text-primary font-bold cursor-pointer hover:underline" @click="goToSignUp">회원가입</span>
                            </div>
                        </div>

                        <Button type="submit" label="로그인 실행" class="w-full p-3 text-xl font-bold" />
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 페이지 중앙 정렬 레이아웃 */
/* 수정된 페이지 중앙 정렬 레이아웃 */
.page-wrapper {
    /* 찾으신 가족/따뜻한 느낌의 이미지 주소를 넣어주세요 */
    background-image: url('./img/로그인.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;

    box-shadow: inset 0 0 0 2000px rgba(254, 249, 246, 0.25);

    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.login-container {
    width: 100%;
    max-width: 450px; /* 약간 더 슬림하게 조정 */
}

/* Sakai 테마 스타일의 카드 테두리 그라데이션 */
/* 2. 카드를 감싸는 테두리 (보라색 -> 코랄 웜톤으로 변경) */
.gradient-card {
    border-radius: 56px;
    padding: 3px; /* 테두리 두께 */
    background: linear-gradient(180deg, rgba(255, 171, 145, 0.9) 0%, rgba(255, 255, 255, 0) 40%);
}

/* 3. 글래스모피즘 (반투명 유리) 카드 핵심 디자인! */
.login-card {
    /* 반투명한 하얀색 배경 (0.65가 가장 예쁩니다. 필요시 조절) */
    background: rgba(255, 255, 255, 0.65);

    /* 뒷배경을 은은하게 흐리게 만드는 효과 */
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px); /* 사파리 브라우저 호환용 */

    /* 유리 표면의 빛 반사 느낌을 주는 얇은 테두리 */
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-top: 1px solid rgba(255, 255, 255, 0.8);

    /* 카드가 붕 떠보이도록 부드러운 그림자 추가 */
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);

    padding: 3rem 2rem;
    border-radius: 53px;
}

.form-group {
    margin-bottom: 1.2rem;
}

/* 유틸리티 클래스 */
.text-center {
    text-align: center;
}
.w-full {
    width: 100%;
}
.block {
    display: block;
}
.flex {
    display: flex;
}
.justify-content-between {
    justify-content: space-between;
}
.cursor-pointer {
    cursor: pointer;
}
.text-primary {
    color: #6366f1;
}
.text-sm {
    font-size: 0.875rem;
}
</style>
