<script setup>
import { ref, onMounted } from 'vue';

// 상태 관리용 변수들
const data = ref(null);
const loading = ref(true);
const error = ref(null);

// 백엔드 API 주소 (본인의 서버 주소로 수정하세요)
const API_URL = '/api/users';

const fetchData = async () => {
    loading.value = true;
    error.value = null;

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`서버 응답 상태: ${response.status}`);
        }

        const result = await response.json();
        data.value = result;
    } catch (err) {
        error.value = err.message;
        console.error('Fetch error:', err);
    } finally {
        loading.value = false;
    }
};

// 컴포넌트가 마운트될 때 자동으로 실행
onMounted(() => {
    fetchData();
});
</script>
<template>
    <div class="server-test">
        <h1>서버 연결 테스트</h1>
        <hr />

        <div v-if="loading">데이터를 불러오는 중...</div>

        <div v-else-if="error" class="error">❌ 에러 발생: {{ error }}</div>

        <div v-else>
            <h3>✅ 서버 데이터 수신 성공!</h3>
            <pre>{{ data }}</pre>
        </div>

        <button @click="fetchData">다시 시도</button>
    </div>
</template>
