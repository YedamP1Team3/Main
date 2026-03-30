<script setup>
import { ref, reactive } from 'vue';

// 좌측 레이아웃 내용을 담을 객체
const searchFilter = reactive({
    startDate: '',
    endDate: '',
    beneName: '',
    managerName: '',
    status: '전체'
});

// 화면에 나타날 데이터 (메인)
// const applicationList = ref([{ no: 1, name: 신재성, startDate: 2026_03_20, applicationList: '', manager: 재성신, priority: 검토, 계획결과진행: 반려, plan: '', end: '' }]);
// 좌측 레이아웃 실행 함수
const handleSearch = () => {
    console.log('현재 검색 조건:', searchFilter);
    // api 호출 로직
};
</script>
<template>
    <header class="main-header"></header>
    <!-- 전체를 감싸는 컨테이너 (Flexbox 적용 대상) -->
    <div class="history-page-container">
        <!-- 좌측 검색 영역 -->
        <aside class="search-sidebar">
            <div class="sidebar-header">
                <h2>상세 검색</h2>
                <button class="btn-reset">초기화</button>
            </div>
            <!-- TODO: 여기에 날짜, 지원자명 등 입력 폼 만들기 -->
            <div class="form-group"><label>이름</label> <input type="text" v-model="searchFilter.beneName" placeholder="이름을 입력하시오" /></div>
            <div class="form-group date-group">
                <label>작성일자</label>
                <div class="date-inputs">
                    <input type="date" v-model="searchFilter.startDate" />
                    <span class="tilde">~</span>
                    <input type="date" v-model="searchFilter.endDate" />
                </div>
            </div>
            <div class="form-group">
                <label>진행 상태</label>
                <select v-model="searchFilter.status">
                    <option value="전체">전체</option>
                    <option value="pending">대기</option>
                    <option value="approved">승인</option>
                    <option value="rejected">반려</option>
                </select>
            </div>
            <button class="btn-search" @click="handleSearch">검색</button>
        </aside>

        <!-- 우측 메인 콘텐츠 영역 -->
        <main class="main-content">
            <h2>지원신청 내역</h2>
            <!-- TODO: 여기에 table 태그를 활용해서 목록 만들기 -->

            <!-- TODO: 페이지네이션 영역 -->
        </main>
    </div>
</template>
<style scoped>
.main-header {
    width: 100%;
    height: 64px;
    background-color: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 100;
}
.history-page-container {
    display: flex;
    width: 100%;
    min-height: calc(100vh - 64px); /* 헤더 높이 제외 */
    background-color: #f8fafc;
    padding: 20px;
    gap: 20px; /* 좌우 영역 사이 간격 */
}
.search-sidebar {
    flex: 0 0 280px; /* 너비 280px 고정, 줄어들거나 늘어나지 않음 */
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}
.main-content {
    flex: 1; /* 남은 공간을 모두 차지함 */
    background-color: white;
    padding: 30px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}
/* 폼 요소들을 세로로 쌓기 위한 기본 틀 */
.form-group {
    display: flex;
    flex-direction: column; /* 위에서 아래로 배치 */
    margin-bottom: 20px; /* 폼 그룹 사이의 간격 */
}

/* 라벨(제목) 스타일 */
.form-group label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 8px; /* 라벨과 입력칸 사이 간격 */
}

/* 입력칸 공통 스타일 */
.form-group input[type='text'],
.form-group input[type='date'],
.form-group select {
    padding: 10px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 0.95rem;
}

/* 날짜 입력칸 가로 정렬 */
.date-inputs {
    display: flex;
    align-items: center;
    gap: 10px;
}
.date-inputs input {
    flex: 1; /* 입력칸이 남는 공간을 공평하게 나눠 가짐 */
}
</style>
