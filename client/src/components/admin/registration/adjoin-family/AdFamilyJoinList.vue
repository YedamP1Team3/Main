<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { CardStyle } from 'primevue';

const router = useRouter();
const authStore = useAuthStore();

// --- 상태 관리 ---
const historyRows = ref([]);
const isLoading = ref(false);
const filterStatus = ref('all');
const searchName = ref('');
const currentPage = ref(1);

// --- 필터링 로직 ---
const filteredRows = computed(() => {
    return historyRows.value.filter((item) => {
        const matchedStatus = filterStatus.value === 'all' || item.status === 'pending';
        const matchedName = !searchName.value || item.userName.includes(searchName.value);
        return matchedStatus && matchedName;
    });
});

// --- 페이지네이션 로직 (10개씩) ---
const paginatedRows = computed(() => {
    const start = (currentPage.value - 1) * 10;
    return filteredRows.value.slice(start, start + 10);
});

const totalPages = computed(() => Math.ceil(filteredRows.value.length / 10) || 1);

// --- 데이터 페칭 ---
const fetchJoinRequests = async () => {
    isLoading.value = true;
    try {
        const res = await axios.get('/api/adhistory/join-requests/family');
        if (res.data.success) {
            historyRows.value = res.data.data;
        }
    } catch (error) {
        console.error('신청 내역을 불러오지 못했습니다.', error);
        // 테스트용 가상 데이터
        historyRows.value = [
            { id: 1, userId: 'hong1', userName: '홍길동', phone: '010-1111-2222', email: 'hong1@naver.com', joinDate: '2026.03.01', status: 'pending' },
            { id: 2, userId: 'youn23', userName: '영길이', phone: '010-2222-3333', email: 'youn23@naver.com', joinDate: '2026.03.03', status: 'approved' },
            { id: 3, userId: 'kim612', userName: '김동홍', phone: '010-1111-4444', email: 'kim612@google.com', joinDate: '2026.03.07', status: 'pending' }
        ];
    } finally {
        isLoading.value = false;
    }
};

// --- 액션 함수 ---
const approveUser = async (userId) => {
    if (confirm('승인하시겠습니까?')) {
        try {
            const res = await axios.post(`/api/adhistory/approve/${userId}`);
            if (res.data.success) {
                alert('승인되었습니다');
                fetchJoinRequests();
            }
        } catch (e) {
            alert('처리 중 오류가 발생했습니다.');
        }
    }
};

const openRejectModal = (user) => {
    console.log('반려 모달 오픈:', user.userName);
};

const deleteUser = async (userId) => {
    if (confirm('정말로 삭제하시겠습니까 ?')) {
        try {
            const res = await axios.delete(`/api/adhistory/delete/${userId}`);
            if (res.data.success) {
                alert('삭제되었습니다');
                fetchJoinRequests();
            }
        } catch (e) {
            alert('삭제 중 오류가 발생했습니다');
        }
    }
};

onMounted(fetchJoinRequests);
</script>

<template>
    <div class="card">
        <h5 class="page-title">회원관리 (일반회원)</h5>

        <div class="filter-container">
            <div class="status-filter">
                <label class="radio-label">
                    <input type="radio" v-model="filterStatus" value="all" @change="currentPage = 1" />
                    <span>전체사용자</span>
                </label>
                <label class="radio-label">
                    <input type="radio" v-model="filterStatus" value="pending" @change="currentPage = 1" />
                    <span>미승인 사용자</span>
                </label>
            </div>

            <div class="search-box">
                <input type="text" v-model="searchName" placeholder="사용자 이름을 입력하세요" @keyup.enter="currentPage = 1" />
                <button type="button" class="btn-search" @click="currentPage = 1">조회</button>
            </div>
        </div>

        <div class="table-wrapper">
            <div v-if="isLoading" class="loading-state">데이터를 불러오는 중입니다...</div>

            <table v-else class="custom-table">
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>아이디</th>
                        <th>사용자이름</th>
                        <th>연락처</th>
                        <th>이메일</th>
                        <th>가입일</th>
                        <th style="width: 140px">승인</th>
                        <th>삭제</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in paginatedRows" :key="item.userId">
                        <td>{{ (currentPage - 1) * 10 + index + 1 }}</td>
                        <td>{{ item.userId }}</td>
                        <td class="font-bold">{{ item.userName }}</td>
                        <td>{{ item.phone }}</td>
                        <td>{{ item.email }}</td>
                        <td>{{ item.joinDate }}</td>
                        <td>
                            <div class="btn-group">
                                <button class="btn-action" @click="approveUser(item.userId)">승인</button>
                                <button class="btn-action-outline" @click="openRejectModal(item)">반려</button>
                            </div>
                        </td>
                        <td>
                            <button class="btn-delete" @click="deleteUser(item.userId)">삭제</button>
                        </td>
                    </tr>
                    <tr v-if="filteredRows.length === 0">
                        <td colspan="8" class="empty-msg">해당 조건에 맞는 신청 내역이 없습니다.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="pagination-wrapper">
            <div class="pagination">
                <button :disabled="currentPage === 1" @click="currentPage--" class="page-nav">이전</button>
                <button v-for="p in totalPages" :key="p" :class="{ active: p === currentPage }" @click="currentPage = p" class="page-num">
                    {{ p }}
                </button>
                <button :disabled="currentPage === totalPages" @click="currentPage++" class="page-nav">이후</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 전체 레이아웃: 팀원의 6번째 사진 스타일 (Sakai 카드) */
.card {
    background: #ffffff;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    margin: 1rem;
}

.page-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #334155;
    /* 기존 1.5rem(약 24px)에서 원하는 만큼 늘립니다. */
    /* 10px 정도 더 띄우고 싶다면 2rem~2.2rem 정도로 변경하거나 직접 px를 사용하세요. */
    margin-bottom: calc(1.5rem + 10px);
}

/* 필터/검색 바 디자인 */
.filter-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8fafc;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
}

.status-filter {
    display: flex;
    gap: 1.5rem;
}

.radio-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.95rem;
    color: #475569;
}

.search-box {
    display: flex;
    gap: 0.5rem;
}

.search-box input {
    padding: 0.6rem 1rem;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    width: 220px;
    font-size: 0.9rem;
}

.btn-search {
    padding: 0.6rem 1.2rem;
    background: #3b82f6; /* 팀원 화면의 포인트 블루 */
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

/* 테이블 스타일: 팀원의 3번/6번 사진의 정갈함 적용 */
.table-wrapper {
    overflow-x: auto;
}

.custom-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
}

.custom-table th {
    background-color: #f1f5f9; /* 6번 사진의 밝은 회색 헤더 */
    color: #475569;
    padding: 1rem;
    text-align: center;
    border-bottom: 2px solid #e2e8f0;
    white-space: nowrap;
}

.custom-table td {
    padding: 1rem;
    border-bottom: 1px solid #f1f5f9;
    text-align: center;
    color: #334155;
    vertical-align: middle;
}

/* 버튼 디자인 */
.btn-group {
    display: flex;
    gap: 0.4rem;
    justify-content: center;
}

.btn-action {
    background: #64748b; /* 승인: 차분한 그레이블루 */
    color: white;
    border: none;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
}

.btn-action-outline {
    background: white;
    color: #64748b;
    border: 1px solid #64748b;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
}

.btn-delete {
    background: white;
    border: 1px solid #ef4444; /* 삭제: 레드 라인 */
    color: #ef4444;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
}

/* 페이지네이션 */
.pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
}

.pagination {
    display: flex;
    gap: 0.3rem;
}

.page-num,
.page-nav {
    min-width: 35px;
    height: 35px;
    border: 1px solid #e2e8f0;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
}

.page-num.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
    font-weight: bold;
}

.page-nav:disabled {
    color: #cbd5e1;
    cursor: not-allowed;
}

.empty-msg {
    padding: 4rem !important;
    color: #94a3b8;
    text-align: center;
}

.font-bold {
    font-weight: 600;
}
</style>
