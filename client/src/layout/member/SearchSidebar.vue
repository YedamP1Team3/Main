<script setup>
import { reactive } from 'vue';

const emit = defineEmits(['search', 'reset']);

const createInitialFilter = () => ({
    startDate: '',
    endDate: '',
    beneName: '',
    managerName: '',
    status: 'all',
    progress: 'all'
});

const searchFilter = reactive(createInitialFilter());

const handleSearch = () => {
    emit('search', {
        ...searchFilter
    });
};

const handleReset = () => {
    Object.assign(searchFilter, createInitialFilter());
    emit('reset');
};
</script>

<template>
    <aside class="search-sidebar">
        <div class="sidebar-header">
            <h2>상세 검색</h2>
            <button class="btn-reset" @click="handleReset">초기화</button>
        </div>

        <div class="form-group">
            <label>지원대상자명</label>
            <input v-model="searchFilter.beneName" type="text" placeholder="이름을 입력하세요." />
        </div>

        <div class="form-group">
            <label>담당자명</label>
            <input v-model="searchFilter.managerName" type="text" placeholder="담당자명을 입력하세요." />
        </div>

        <div class="form-group date-group">
            <label>지원신청일</label>
            <div class="date-inputs">
                <input v-model="searchFilter.startDate" type="date" />
                <span class="tilde">~</span>
                <input v-model="searchFilter.endDate" type="date" />
            </div>
        </div>

        <div class="form-group">
            <label>대기단계</label>
            <select v-model="searchFilter.status">
                <option value="all">전체</option>
                <option value="pending">대기</option>
                <option value="approved">승인</option>
                <option value="rejected">반려</option>
            </select>
        </div>

        <div class="form-group">
            <label>계획/결과 진행</label>
            <select v-model="searchFilter.progress">
                <option value="all">전체</option>
                <option value="application">신청 접수</option>
                <option value="plan">계획서 등록</option>
                <option value="result">결과서 등록</option>
                <option value="none">없음</option>
            </select>
        </div>

        <button class="btn-search" @click="handleSearch">검색</button>
    </aside>
</template>

<style scoped>
.search-sidebar {
    flex: 0 0 280px;
    height: fit-content;
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

.sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.sidebar-header h2 {
    margin: 0;
    font-size: 1.1rem;
    color: #1e293b;
}

.btn-reset {
    border: none;
    background: transparent;
    color: #64748b;
    font-size: 0.85rem;
    cursor: pointer;
}

.btn-reset:hover {
    text-decoration: underline;
}

.form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
}

.form-group label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 8px;
}

.form-group input[type='text'],
.form-group input[type='date'],
.form-group select {
    padding: 10px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 0.95rem;
}

.form-group input[type='text']:focus,
.form-group input[type='date']:focus,
.form-group select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.date-inputs {
    display: flex;
    align-items: center;
    gap: 10px;
}

.date-inputs input {
    flex: 1;
}

.tilde {
    color: #64748b;
    font-size: 0.9rem;
}

.btn-search {
    width: 100%;
    border: none;
    background-color: #1e293b;
    color: #ffffff;
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
}

.btn-search:hover {
    background-color: #0f172a;
}
</style>
