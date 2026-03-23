<template>
    <div class="page-wrapper">
        <div class="login-container">
            <div class="gradient-card">
                <div class="login-card">
                    <div class="text-center mb-5">
                        <div class="text-900 text-3xl font-medium mb-3">Welcome!</div>
                        <span class="text-600 font-medium">서비스 이용을 위해 로그인해주세요</span>
                    </div>

                    <form @submit.prevent="login">
                        <div class="form-group">
                            <label for="userId" class="block text-900 font-medium mb-2">ID</label>
                            <InputText id="userId" v-model="form.userId" placeholder="아이디를 입력하세요" class="w-full p-3" />
                        </div>

                        <div class="form-group">
                            <label for="password" class="block text-900 font-medium mb-2">Password</label>
                            <Password id="password" v-model="form.password" placeholder="비밀번호를 입력하세요" :toggleMask="true" :feedback="false" class="w-full" inputClass="w-full p-3" />
                        </div>

                        <div class="links-row flex justify-content-between mt-2 mb-5">
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

import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';

const router = useRouter();

const form = reactive({
    userId: '',
    password: ''
});

const login = async () => {
    if (!form.userId || !form.password) {
        alert('아이디와 비밀번호를 입력해주세요.');
        return;
    }

    try {
        const response = await axios.post('http://localhost:5173/login', {
            userId: form.userId,
            password: form.password
        });
        alert(`${response.data.user.name}님 환영합니다!`);
        router.push('/dashboard'); // 로그인 성공 후 이동할 페이지
    } catch (error) {
        alert(error.response?.data?.message || '로그인 실패');
    }
};

const goToSignUp = () => {
    router.push('/signup');
};

const findId = () => {
    console.log('아이디 찾기 페이지로 이동');
};

const findPw = () => {
    console.log('비밀번호 찾기 페이지로 이동');
};
</script>
<style scoped>
/* 전체 화면 배경 (연한 하늘색 유지) */
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
    max-width: 500px;
}

/* Sakai 특유의 그라데이션 카드 테두리 */
.gradient-card {
    border-radius: 56px;
    padding: 0.3rem;
    background: linear-gradient(180deg, #6366f1 10%, rgba(99, 102, 241, 0) 30%);
}

.login-card {
    background: var(--surface-card, #ffffff);
    padding: 3rem 2rem;
    border-radius: 53px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 1.5rem;
}

.text-center {
    text-align: center;
}
.mb-5 {
    margin-bottom: 2rem;
}
.mb-3 {
    margin-bottom: 1rem;
}
.mb-2 {
    margin-bottom: 0.5rem;
}
.mt-2 {
    margin-top: 0.5rem;
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
.text-primary {
    color: #6366f1;
} /* 기본 테마 색상 */
.cursor-pointer {
    cursor: pointer;
}
</style>
