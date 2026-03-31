<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import axios from 'axios'; // 서버와 통신하기 위한 axios 라이브러리 임포트

const router = useRouter();

/* 1. 인증 스토어에서 로그인한 유저 정보 가져오기 */
const authStore = useAuthStore();
const { userId } = storeToRefs(authStore); // 내 대상자만 가져오기 위해 userId(family_id)를 추가로 추출

/* 2. 지원대상자 더미 데이터 (나중에 DB 연결 시 API로 교체하세요!) */
// [수정] 기존의 더미데이터는 삭제하고 빈 배열([])로 초기화
const recipients = ref([]);
const userInfo = ref({
    userId: '',
    userName: '',
    userEmail: '',
    organization: '',
    phone: '',
    joinDate: ''
});

//  날짜 형식을 YYYY-MM-DD로 변환
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`; // 1990-01-01 형식
};

const fetchMyDetail = async () => {
    try {
        // 수정페이지에서 썼던 API와 동일하거나 유사한 상세조회 API 호출
        const response = await axios.get(`/api/info/user-detail/${userId.value}`);
        const data = response.data;

        // 서버에서 받은 데이터를 화면용 변수에 할당
        userInfo.value.userId = data.user_id;
        userInfo.value.userName = data.user_name;
        userInfo.value.userEmail = data.email;
        userInfo.value.organization = data.agency_name; // 혹은 data.region + data.agency_name
        userInfo.value.phone = data.tel;
        userInfo.value.joinDate = formatDate(data.created_at); // DB 컬럼명에 맞춰 수정
    } catch (error) {
        console.error('데이터 조회 실패:', error);
    }
};

// 서버에서 지원대상자 목록을 가져오는 함수
const fetchRecipients = async () => {
    try {
        // 서버의 /recipient/list/유저ID 경로로 데이터를 요청함
        const response = await axios.get(`/api/recipient/list/${userId.value}`);

        if (response.data.success) {
            // 성공 시 서버에서 받은 리스트(list)를 우리 화면의 recipients 변수에 담는다
            recipients.value = response.data.list;
        }
    } catch (error) {
        console.error('데이터 로드 실패:', error); // 에러 발생 시 콘솔에 내용을 출력
    }
};

onMounted(() => {
    fetchMyDetail(); // 페이지 로드 시 DB 데이터 조회
    fetchRecipients(); // 기존 지원대상자 조회
});

/* 3. 수정 페이지 이동 함수  */
const goToMemberEdit = () => {
    router.push({ name: 'myInfoEdit' }); // 내 정보 수정 페이지로 이동
};

const goToRecipientEdit = (id) => {
    router.push({ name: 'recipientEdit', params: { id: id } }); // 대상자 수정 페이지로 ID값과 함께 이동
};

const goToAddRecipient = () => {
    router.push({ name: 'recipientList' }); // 대상자 추가 페이지로 이동
};
</script>

<template>
    <div class="member-info-wrapper">
        <section class="card mb-6">
            <div class="section-header">
                <h2 class="text-2xl font-bold m-0 text-900">기본 정보 확인</h2>
                <button class="p-button p-button-outlined p-button-sm" @click="goToMemberEdit">수정하기</button>
            </div>

            <div class="info-grid-container flex flex-wrap gap-4 mt-4">
                <div class="info-item">
                    <label class="font-semibold text-sm text-600 block mb-2">이름</label>
                    <div class="p-inputtext surface-100 border-none">{{ userInfo.userName }}</div>
                </div>
                <div class="info-item">
                    <label class="font-semibold text-sm text-600 block mb-2">아이디</label>
                    <div class="p-inputtext surface-100 border-none">{{ userInfo.userId }}</div>
                </div>
                <div class="info-item">
                    <label class="font-semibold text-sm text-600 block mb-2">이메일</label>
                    <div class="p-inputtext surface-100 border-none">{{ userInfo.userEmail }}m</div>
                </div>
                <div class="info-item">
                    <label class="font-semibold text-sm text-600 block mb-2">소속기관</label>
                    <div class="p-inputtext surface-100 border-none">ㅁㅁ 복지기관</div>
                </div>
                <div class="info-item">
                    <label class="font-semibold text-sm text-600 block mb-2">가입날짜</label>
                    <div class="p-inputtext surface-100 border-none">{{ userInfo.joinDate }}</div>
                </div>
                <div class="info-item">
                    <label class="font-semibold text-sm text-600 block mb-2">전화번호</label>
                    <div class="p-inputtext surface-100 border-none">{{ userInfo.phone }}</div>
                </div>
            </div>
        </section>

        <section class="card mt-6">
            <div class="section-header">
                <h2 class="text-2xl font-bold m-0 text-900">지원대상자</h2>
                <button class="p-button p-button-outlined p-button-sm text-teal-600 border-teal-600" @click="goToAddRecipient"><i class="pi pi-plus mr-2"></i>추가하기</button>
            </div>

            <div class="recipient-list-scroll mt-4">
                <div v-for="person in recipients" :key="person.bene_id" class="recipient-card shadow-1">
                    <div class="recipient-info">
                        <div class="text-xl font-bold mb-2 text-900">{{ person.bene_name }}</div>
                        <div class="text-sm text-600">{{ formatDate(person.birth_date) }}</div>
                        <div class="text-sm text-600">{{ person.disability_type }}</div>
                        <div class="text-sm text-600">{{ person.relationship }} | {{ person.gender === 'M' ? '남성' : '여성' }}</div>
                    </div>
                    <div class="recipient-action ml-auto">
                        <button class="p-button p-button-text p-button-sm p-0 h-2rem text-teal-600" @click="goToRecipientEdit(person.bene_id)">수정</button>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
/* 전체 컨테이너 */
.member-info-wrapper {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

/* 공통 카드 스타일 - 우선순위 강화 */
.member-info-wrapper .card {
    background: white !important;
    border-radius: 16px !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05) !important;
    border: none !important;
    padding: 2rem !important;
}

/* ⭐ 핵심: 제목과 버튼을 감싸는 헤더 영역에 밑줄 부여 */
.member-info-wrapper .section-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding-bottom: 1rem !important;
    border-bottom: 2px solid #f1f5f9 !important; /* 여기에 선을 그어야 버튼까지 포함됩니다 */
    margin-bottom: 1.5rem !important;
}

/* 정보 항목 레이아웃 */
.member-info-wrapper .info-item {
    flex: 1 1 calc(33.33% - 2rem);
    min-width: 280px;
}

.member-info-wrapper .p-inputtext {
    padding: 0.85rem;
    border-radius: 8px;
    font-size: 1rem;
    display: flex;
    align-items: center;
    height: 48px;
    background-color: #f8fafc !important;
}

/* 버튼 줄바꿈 방지 및 스타일 */
.member-info-wrapper .p-button-sm {
    white-space: nowrap !important;
    min-width: fit-content !important;
    padding: 0.5rem 1rem !important;
    font-size: 0.85rem !important;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
}

/* 지원대상자 그리드 (3열 고정) */
.member-info-wrapper .recipient-list-scroll {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 1.5rem !important;
    max-height: 450px;
    overflow-y: auto;
    padding: 5px;
}

/* 개별 카드 */
.member-info-wrapper .recipient-card {
    display: flex !important;
    justify-content: space-between !important;
    padding: 1.5rem !important;
    background-color: #ffffff !important;
    border: 1px solid #f1f5f9 !important;
    border-radius: 12px !important;
    transition: all 0.2s ease;
}

.member-info-wrapper .recipient-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1) !important;
    border-color: #10b981 !important;
}

/* 스크롤바 커스텀 */
.recipient-list-scroll::-webkit-scrollbar {
    width: 6px;
}
.recipient-list-scroll::-webkit-scrollbar-thumb {
    background-color: #e2e8f0;
    border-radius: 10px;
}
</style>
