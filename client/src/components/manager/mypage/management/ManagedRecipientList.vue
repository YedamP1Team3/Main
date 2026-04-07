<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// 로그인된 담당자 ID를 store에서 가져오기
const managerId = computed(() => authStore.user?.user_id || authStore.userId);

const beneficiaries = ref([]);
const totalCount = ref(0);
const currentPage = ref(1);
const totalPages = ref(1);
const selectedPerson = ref(null);

const fetchBeneficiaries = async (page = 1) => {
    // 담당자 ID가 없으면 실행 X
    if (!managerId.value) {
        console.error('로그인 정보가 없습니다.');
        return;
    }

    try {
        const response = await axios.get(`/api/mgtargets/list/${managerId.value}`, {
            params: { page: page }
        });
        if (response.data.success) {
            beneficiaries.value = response.data.list;
            totalCount.value = response.data.total;
            totalPages.value = response.data.totalPages;
            currentPage.value = response.data.success ? page : currentPage.value;

            // 리스트가 바뀌면 첫 번째 사람을 다시 선택
            if (beneficiaries.value.length > 0) {
                selectedPerson.value = beneficiaries.value[0];
            }
        }
    } catch (error) {
        console.error('데이터 로딩 실패:', error);
    }
};

const selectBeneficiary = (person) => {
    selectedPerson.value = person;
};

const changePage = (page) => {
    if (page < 1 || page > totalPages.value) return;
    fetchBeneficiaries(page);
};

onMounted(() => {
    fetchBeneficiaries();
});
</script>

<template>
    <div class="beneficiary-page-wrapper">
        <section class="list-section">
            <div class="list-header">
                <h4>담당 지원자 목록</h4>
                <span class="total-badge">총 {{ totalCount }}명</span>
            </div>

            <ul class="beneficiary-list">
                <li v-for="person in beneficiaries" :key="person.id" @click="selectBeneficiary(person)" :class="{ selected: selectedPerson?.id === person.id }">
                    <span class="name">{{ person.name }}</span>
                    <span class="arrow-icon"></span>
                </li>
            </ul>

            <div class="pagination">
                <button class="page-nav" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">이전</button>
                <div class="page-numbers">
                    <button v-for="page in totalPages" :key="page" @click="changePage(page)" :class="{ active: currentPage === page }">
                        {{ page }}
                    </button>
                </div>
                <button class="page-nav" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">이후</button>
            </div>
        </section>

        <section class="detail-section">
            <div v-if="selectedPerson" class="detail-content">
                <div class="detail-header">
                    <h4>{{ selectedPerson.name }}</h4>
                </div>
                <table class="detail-table">
                    <tbody>
                        <tr>
                            <th>이름</th>
                            <td>{{ selectedPerson.name }}</td>
                        </tr>
                        <tr>
                            <th>생년월일</th>
                            <td>{{ selectedPerson.birth }}</td>
                        </tr>
                        <tr>
                            <th>성별</th>
                            <td>{{ selectedPerson.gender }}</td>
                        </tr>
                        <tr>
                            <th>주소</th>
                            <td>{{ selectedPerson.address }}</td>
                        </tr>
                        <tr>
                            <th>장애유형</th>
                            <td>{{ selectedPerson.type }}</td>
                        </tr>
                        <tr>
                            <th>보호자</th>
                            <td>{{ selectedPerson.guardian }}</td>
                        </tr>
                        <tr>
                            <th>연락처</th>
                            <td>{{ selectedPerson.phone }}</td>
                        </tr>
                        <tr>
                            <th>이메일</th>
                            <td>{{ selectedPerson.email }}</td>
                        </tr>
                        <tr>
                            <th>등록일</th>
                            <td>{{ selectedPerson.regDate }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else class="no-selection">
                <p>목록에서 지원자를 선택하시면 상세 정보를 확인할 수 있습니다.</p>
            </div>
        </section>
    </div>
</template>

<style scoped>
.beneficiary-page-wrapper {
    display: flex;
    height: calc(100vh - 150px); /* 헤더 등을 제외한 높이 */
    background-color: #fff;
    border: 2px solid #f4e2de;
    border-radius: 12px;
    margin: 2.5rem;
}

/* 목록 영역 */
.list-section {
    width: 320px;
    border-right: 2px solid #f4e2de;
    display: flex;
    flex-direction: column; /* 세로 배치 */
    padding: 20px;
    height: 100%; /* 부모 높이를 다 채우도록 설정 */
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.total-badge {
    font-size: 13px;
    color: #666;
}

.beneficiary-list {
    list-style: none;
    padding: 0;
    margin: 0;
    border: 1px solid #ddd;
    /* flex-grow를 빼거나 유지해도 되지만, 페이징을 아래로 밀기 위해 아래 설정이 중요합니다 */
    overflow-y: auto;
    max-height: calc(100% - 120px); /* 페이징과 헤더 공간 확보 */
}

.beneficiary-list li {
    padding: 15px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.beneficiary-list li:last-child {
    border-bottom: none;
}

.beneficiary-list li.selected {
    background-color: #fef9f6;
    border-left: 4px solid #f3c4b9;
    font-weight: bold;
}

.arrow-icon::after {
    content: '>';
    color: #666;
}

/* 페이징 */
.pagination {
    margin-top: auto; /* 위쪽 여백을 자동으로 채워 아래로 밀어냄 */
    padding-top: 20px; /* 리스트와의 간격 */
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
    background-color: #fff; /* 리스트가 길어져도 겹치지 않게 배경색 지정 */
}

.page-numbers button,
.page-nav {
    padding: 6px 10px;
    border: 1px solid #e2e8f0;
    background: #fff;
    cursor: pointer;
    border-radius: 4px;
    color: #64748b;
    font-size: 13px;
    transition: all 0.2s;
}

/* [3] ⭐ 활성화된(선택된) 페이지 번호 스타일 */
.page-numbers button.active {
    background-color: #ffab91 !important;
    border-color: #ffab91 !important;
    color: #fff !important;
    font-weight: bold;
}

/* [4] 마우스 올렸을 때(Hover) 효과 */
.page-numbers button:hover:not(.active),
.page-nav:hover:not(:disabled) {
    background-color: #fff5f2; /* 매우 연한 코랄빛 */
    border-color: #ffab91;
    color: #ffab91;
}

/* [5] 비활성화된 이전/이후 버튼 */
.page-nav:disabled {
    color: #cbd5e1;
    cursor: not-allowed;
    background-color: #f8fafc;
    border-color: #e2e8f0;
}

.page-nav {
    padding: 5px 8px;
    font-size: 12px;
    background: #f9f9f9;
    border: 1px solid #ddd;
    cursor: pointer;
}

/* 상세 정보 영역 */
.detail-section {
    flex: 1;
    padding: 40px;
    overflow-y: auto;
}

.detail-header {
    border-bottom: 2px solid #f4e2de;
    padding-bottom: 15px;
    margin-bottom: 25px;
}

.detail-table {
    width: 100%;
    border-collapse: collapse;
}

.detail-table th {
    width: 150px;
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
    background-color: #fdfdfd;
    color: #666;
}

.detail-table td {
    padding: 15px;
    border-bottom: 1px solid #eee;
    color: #333;
}

.no-selection {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #999;
}
</style>
