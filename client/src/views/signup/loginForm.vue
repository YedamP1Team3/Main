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

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth'; //pinia 스토어 불러오기

// PrimeVue 컴포넌트 (main.js에 등록했다면 여기서 생략 가능)
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';

const router = useRouter();
const authStore = useAuthStore(); // ★ 2. 스토어 사용 준비

// 1. 데이터 상태 관리
const form = reactive({
    userId: '',
    password: ''
});

// 2. 로그인 실행 로직
const handleLogin = async () => {
    // 유효성 검사
    if (!form.userId || !form.password) {
        alert('아이디와 비밀번호를 모두 입력해주세요.');
        return;
    }

    try {
        // 백엔드 서버(3000번 포트)로 요청 전송
        const response = await axios.post('/info/login', {
            userId: form.userId,
            password: form.password
        });

        // 성공 시 처리
        if (response.data) {
            const user = response.data.user;
            authStore.login(user);
            const userRole = user.role.toUpperCase();

            if (userRole === 'ADMIN') {
                alert(`${user.name}님 환영합니다 관리자페이지로 이동합니다`);
                router.push('/AdministratorMain');
            } else if (userRole === 'MANAGER') {
                alert(`${user.name}님 환영합니다 담당자페이지로 이동합니다`);
                router.push('/BeneficiaryMain');
            } else if (userRole === 'FAMILY') {
                alert(`${user.name}님 환영합니다 일반사용자 페이지로 이동합니다.`);
                // router.push('/recipient');
                router.push('/memberApplication');
            } else {
                alert(`${user.name}님 환영합니다`);
            }
        }
    } catch (error) {
        // 상세 에러 메시지가 있으면 보여주고, 없으면 기본 메시지 출력
        const errorMsg = error.response?.data?.message || '로그인 중 오류가 발생했습니다.';
        alert(errorMsg);
        console.error('Login Error:', error);
    }
};

// 3. 페이지 이동 함수들
const goToSignUp = () => router.push('/signup');
const findId = () => alert('서비스 준비 중입니다.');
const findPw = () => alert('서비스 준비 중입니다.');
</script>

<style scoped>
/* 페이지 중앙 정렬 레이아웃 */
.page-wrapper {
    background-color: #dae8f5;
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
.gradient-card {
    border-radius: 56px;
    padding: 0.3rem;
    background: linear-gradient(180deg, #6366f1 10%, rgba(99, 102, 241, 0) 30%);
}

.login-card {
    background: #ffffff;
    padding: 3rem 2rem;
    border-radius: 53px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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
