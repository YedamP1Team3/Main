<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';

const router = useRouter();

/* 1. 인증 스토어에서 로그인한 유저 정보 가져오기 */
const authStore = useAuthStore();
const { userName, userRole } = storeToRefs(authStore);

/* 2. 지원대상자 더미 데이터 (나중에 DB 연결 시 API로 교체하세요!) */
const recipients = ref([
    { id: 1, name: '홍길동', birth: '1999-01-01', type: '지적장애', relation: '부모 | 남성' },
    { id: 2, name: '홍길순', birth: '2001-12-12', type: 'ADHD', relation: '친족 | 여성' }
]);

/* 3. 수정 페이지 이동 함수 (추후 구현) */
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
            <div class="flex justify-content-between align-items-center mb-5">
                <h2 class="text-2xl font-bold m-0 text-900">기본 정보 확인</h2>
                <button class="p-button p-button-outlined p-button-sm" style="margin-left: 10px" @click="goToMemberEdit">수정하기</button>
            </div>

            <div class="info-grid-container flex flex-wrap gap-4">
                <div class="info-item">
                    <label class="font-semibold text-sm text-600 block mb-2">이름</label>
                    <div class="p-inputtext surface-100 border-none">{{ userName }}</div>
                </div>

                <div class="info-item">
                    <label class="font-semibold text-sm text-600 block mb-2">아이디</label>
                    <div class="p-inputtext surface-100 border-none">hong1</div>
                </div>

                <div class="info-item">
                    <label class="font-semibold text-sm text-600 block mb-2">이메일</label>
                    <div class="p-inputtext surface-100 border-none">hong1@naver.com</div>
                </div>

                <div class="info-item">
                    <label class="font-semibold text-sm text-600 block mb-2">소속기관</label>
                    <div class="p-inputtext surface-100 border-none">ㅁㅁ복지센터</div>
                </div>

                <div class="info-item">
                    <label class="font-semibold text-sm text-600 block mb-2">가입날짜</label>
                    <div class="p-inputtext surface-100 border-none">2026.03.11</div>
                </div>

                <div class="info-item">
                    <label class="font-semibold text-sm text-600 block mb-2">전화번호</label>
                    <div class="p-inputtext surface-100 border-none">010-1111-2222</div>
                </div>
            </div>
        </section>

        <section class="mt-6">
            <h2 class="text-2xl font-bold mb-4 text-900">지원대상자</h2>

            <div class="recipient-list-scroll flex gap-4 pb-3">
                <div v-for="person in recipients" :key="person.id" class="recipient-card card flex-shrink-0 p-4 shadow-1 border-1 surface-border flex-direction-row">
                    <div class="recipient-info">
                        <div class="text-xl font-bold mb-2 text-900">{{ person.name }}</div>
                        <div class="text-sm text-600">{{ person.birth }}</div>
                        <div class="text-sm text-600">{{ person.type }}</div>
                        <div class="text-sm text-600">{{ person.relation }}</div>
                    </div>
                    <div class="recipient-action ml-auto">
                        <button class="p-button p-button-text p-button-sm p-0 h-2rem text-teal-600" @click="goToRecipientEdit(person.id)">수정</button>
                    </div>
                </div>

                <div class="recipient-card add-card card flex align-items-center justify-content-center cursor-pointer hover:surface-100 border-dashed border-2 surface-border" @click="goToAddRecipient">
                    <div class="text-center">
                        <i class="pi pi-plus text-400 mb-2" style="font-size: 2rem"></i>
                        <div class="text-600 font-medium">새로운 대상자를 추가하세요</div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
/* 본문 전체 여백 */
.member-info-wrapper {
    padding: 2rem;
    max-width: 1200px; /* 본문이 너무 옆으로 퍼지지 않게 제한 */
    margin: 0 auto; /* 중앙 정렬 */
}

/* ⭐ [상단] 정보 항목 스타일 (3열 배치) */
.info-item {
    flex: 1 1 calc(33.33% - 2rem); /* 부모 Gap을 고려하여 너비를 33.3%로 설정 */
    min-width: 280px; /* 너무 좁아지면 줄바꿈 되게 최소 너비 보장 */
}

/* 정보 확인 칸 디자인 (읽기 전용 느낌) */
.p-inputtext {
    padding: 0.85rem; /* 안쪽 여백을 기획안처럼 넉넉히 */
    border-radius: 8px; /* 모서리 둥글게 */
    font-size: 1rem; /* 글자 크기 */
    display: flex; /* 내부 글자 정렬용 */
    align-items: center; /* 세로 중앙 정렬 */
    height: 48px; /* 기획안의 인풋박스 높이 느낌 */
}

/* ⭐ [하단] 스크롤 컨테이너 설정 */
.recipient-list-scroll {
    overflow-x: auto !important; /* 가로 스크롤 강제 활성화 */
    -webkit-overflow-scrolling: touch; /* 아이폰 등에서 부드러운 스크롤 */
    white-space: nowrap; /* 내용물이 줄바꿈 되지 않게 함 */
}

/* 지원대상자 카드 스타일 (가로 배치용) */
.recipient-card {
    width: 320px; /* 카드 가로 길이는 그대로 유지 */

    /* 🥟 기존의 min-height 대신, 홍길동 카드 높이에 맞춰 height를 고정합니다. */
    /* 사진상 홍길동 카드의 높이가 약 180px 정도 되어 보이네요. */
    height: 180px;

    display: flex; /* 내부 내용 가로 배치 유지 */
    flex-direction: row;
    align-items: flex-start; /* 위쪽 정렬 유지 */
    gap: 1.5rem;

    /* ⭐ 중요: 추가 카드가 이 높이를 오롯이 가지게 하기 위해 패딩을 조절합니다. */
    box-sizing: border-box;
    padding: 1.5rem;
}

/* 추가 버튼 카드 스타일 (점선 테두리) */
.add-card {
    background-color: #f8fafc; /* 연한 배경 */

    /* 🥟 추가 카드는 내용이 중앙에 와야 예쁘므로 flex 설정을 덮어씁니다. */
    display: flex !important;
    flex-direction: column !important; /* 세로 배치 */
    justify-content: center !important; /* 세로 중앙 */
    align-items: center !important; /* 가로 중앙 */
    padding: 0 !important; /* 내부 패딩을 없애고 height로만 중앙 정렬 */
}
</style>
