<script setup>
// 1. 필요한 도구들을 가져오는 단계
import { onMounted, ref } from 'vue'; // 시작 시 실행 함수와 반응형 데이터를 만드는 도구
import { useRouter } from 'vue-router'; // 페이지 이동을 도와주는 도구
import { useAuthStore } from '@/stores/auth'; // 로그인된 유저 정보를 저장하는 창고
import { storeToRefs } from 'pinia'; // 저장소 데이터를 반응형으로 꺼내오기 위한 도구
import axios from 'axios'; // 서버와 통신(HTTP)하기 위한 도구

const router = useRouter(); // 라우터 기능 사용 준비

/* 1. 로그인한 사용자의 ID 가져오기 */
const authStore = useAuthStore(); // 인증 정보 창고를 엽니다.
const { userId } = storeToRefs(authStore); // 창고에서 현재 로그인한 유저의 ID를 꺼냅니다.

/* 2. 화면에 보여줄 데이터 바구니들 */
const recipients = ref([]); // 서버에서 받아올 '지원 대상자 목록'이 담길 빈 리스트
const userInfo = ref({
    // 내 프로필 정보가 담길 객체
    userId: '',
    userName: '',
    userEmail: '',
    organization: '',
    phone: '',
    joinDate: ''
});

// 날짜 형식 도우미: DB의 복잡한 날짜 정보를 "2026-04-01"처럼 예쁘게 잘라줍니다.
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear(); // 연도 추출
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // 월 추출 (두 자릿수 맞춤)
    const day = ('0' + date.getDate()).slice(-2); // 일 추출 (두 자릿수 맞춤)
    return `${year}-${month}-${day}`;
};

// [함수 A] 내 상세 정보(프로필)를 서버에서 가져오기
const fetchMyDetail = async () => {
    try {
        // 서버에 내 ID를 보내서 상세 데이터를 달라고 요청(GET)합니다.
        const response = await axios.get(`/api/info/user-detail/${userId.value}`);
        const data = response.data; // 서버에서 받은 데이터(user_id 등)를 우리 바구니(userInfo)에 맞게 옮겨 담습니다.

        userInfo.value.userId = data.user_id;
        userInfo.value.userName = data.user_name;
        userInfo.value.userEmail = data.email;
        userInfo.value.organization = data.agency_name;
        userInfo.value.phone = data.tel;
        userInfo.value.joinDate = formatDate(data.created_at); // 날짜는 예쁘게 변환해서 저장
    } catch (error) {
        console.error('내 데이터 조회 실패:', error); // 에러 발생 시 로그 출력
    }
};

// [함수 B] 내가 관리하는 지원 대상자 목록을 서버에서 가져오기
const fetchRecipients = async () => {
    try {
        // 서버의 대상자 목록 API에 내 ID를 보내서 명단을 요청합니다.
        const response = await axios.get(`/api/recipient/list/${userId.value}`);

        if (response.data.success) {
            // 성공했다면 서버가 보내준 명단(list)을 recipients 바구니에 쏙 넣습니다.
            recipients.value = response.data.list;
        }
    } catch (error) {
        console.error('대상자 목록 로드 실패:', error);
    }
};

// 3. 페이지가 화면에 나타날 때 실행되는 구간
onMounted(() => {
    fetchMyDetail(); // 내 프로필 가져오기 실행
    fetchRecipients(); // 관리 대상자 목록 가져오기 실행
});

/* 4. 다른 페이지로 보내주는 안내판 기능 */
// 내 정보 수정 페이지로 이동
const goToMemberEdit = () => {
    router.push({ name: 'myInfoEdit' });
};

// 특정 대상자의 수정 페이지로 이동 (누구인지 알아야 하므로 id를 가지고 갑니다)
const goToRecipientEdit = (id) => {
    router.push({ name: 'recipientEdit', params: { id: id } });
};

// 대상자 추가(리스트) 페이지로 이동
const goToAddRecipient = () => {
    router.push({ name: 'recipientList' });
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
