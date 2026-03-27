<script setup>
import { ref, onMounted } from 'vue'; // 반응형 데이터 처리를 위한 ref
import { useRouter } from 'vue-router'; // 페이지 이동을 위한 router
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const router = useRouter(); // 라우터 인스턴스 생성
const authStore = useAuthStore();

// 사용자 정보 데이터 객체 (소속 기관 필드 추가)
const memberForm = ref({
    name: '',
    id: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    agencyRegion: '',
    agencyName: '',
    postcode: '',
    address: '',
    detailAddress: '',
    phone: '',
    email: ''
});

// 카카오 주소 API 실행 함수
const openPostcode = () => {
    new window.daum.postcode({
        oncomplete: (data) => {
            let fullAddr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;

            memberForm.value.address = fullAddr;
            memberForm.value.postcode = data.zonecode;

            const detailInput = document.querySelector('input[placeholder="상세주소를 입력하세요"]');
            if (detailInput) detailInput.focus();
        }
    }).open();
};

onMounted(async () => {
    if (authStore.userId) {
        try {
            // Pinia 대신 서버 DB에서 직접 조회
            const response = await axios.get(`/info/user-detail/${authStore.userId}`);

            console.log('전체 응답:', response);

            console.log('서버에서 온 데이터: ', response.data);

            const data = response.data;

            memberForm.value.id = data.user_id;
            memberForm.value.name = data.user_name;
            memberForm.value.phone = data.phone;
            memberForm.value.email = data.email;
            memberForm.value.postcode = data.zip_code;
            memberForm.value.address = data.address;
            memberForm.value.detailAddress = data.detail_address;
            memberForm.value.agencyName = data.agency_name;
            memberForm.value.agencyRegion = data.region;
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            alert('정보를 불러오는 중 오류가 발생했습니다.');
        }
    } else {
        alert('로그인 정보가 없습니다.');
        router.push({ name: 'loginForm' });
    }
});

// 정보 저장 로직
const saveInfo = async () => {
    // 비밀번호 확인 로직 (기획서 2번 내용 준수)
    if (memberForm.value.newPassword !== memberForm.value.confirmPassword) {
        alert('새 비밀번호와 확인 값이 일치하지 않습니다.');
        return;
    }

    try {
        // 서버에 수정 요청 (PUT)
        const response = await axios.put('/info/update-user', memberForm.value);
        if (response.status === 200) {
            alert('수정 완료 !');
            router.push({ name: 'myInfo' });
        }
    } catch (error) {
        alert('수정 중 오류가 발생했습니다.');
    }
};
</script>

<template>
    <div class="content-wrapper">
        <div class="form-container">
            <h2 class="form-title">내 정보 수정</h2>

            <form @submit.prevent="saveInfo">
                <div class="form-grid">
                    <div class="input-set">
                        <label>이름</label>
                        <input type="text" v-model="memberForm.name" class="p-inputtext p-inputtext-sm" />
                    </div>
                    <div class="input-set">
                        <label>아이디</label>
                        <input type="text" v-model="memberForm.id" class="p-inputtext p-inputtext-sm" disabled />
                    </div>
                </div>

                <div class="password-section">
                    <h3 class="sub-title">비밀번호 변경</h3>
                    <div class="title-line"></div>

                    <div class="password-flex-column">
                        <div class="input-set">
                            <label>현재 비밀번호</label>
                            <input type="password" v-model="memberForm.currentPassword" class="p-inputtext p-inputtext-sm" placeholder="기존 비밀번호를 입력하세요" />
                        </div>
                        <div class="input-set">
                            <label>새 비밀번호</label>
                            <input type="password" v-model="memberForm.newPassword" class="p-inputtext p-inputtext-sm" placeholder="새 비밀번호 입력" />
                        </div>
                        <div class="input-set">
                            <label>새 비밀번호 확인</label>
                            <input type="password" v-model="memberForm.confirmPassword" class="p-inputtext p-inputtext-sm" placeholder="새 비밀번호 재입력" />
                        </div>
                    </div>
                </div>

                <h3 class="sub-title">추가 정보</h3>
                <div class="title-line"></div>

                <div class="form-grid">
                    <div class="input-set full-width">
                        <label>소속 기관</label>
                        <div class="flex gap-2">
                            <input type="text" v-model="memberForm.agencyRegion" class="p-inputtext p-inputtext-sm flex-1" placeholder="지역" />
                            <input type="text" v-model="memberForm.agencyName" class="p-inputtext p-inputtext-sm flex-2" placeholder="센터명" />
                        </div>
                    </div>

                    <div class="input-set full-width">
                        <label>주소</label>
                        <div class="address-group">
                            <div class="flex gap-2 mb-2">
                                <input type="text" v-model="memberForm.postcode" class="p-inputtext p-inputtext-sm w-6rem" readonly />
                                <button type="button" class="post-btn" @click="openPostcode">우편번호 검색</button>
                            </div>
                            <input type="text" v-model="memberForm.address" class="p-inputtext p-inputtext-sm mb-2" readonly />
                            <input type="text" v-model="memberForm.detailAddress" class="p-inputtext p-inputtext-sm" placeholder="상세주소를 입력하세요" />
                        </div>
                    </div>

                    <div class="input-set">
                        <label>전화번호</label>
                        <input type="text" v-model="memberForm.phone" class="p-inputtext p-inputtext-sm" />
                    </div>
                    <div class="input-set">
                        <label>이메일 주소</label>
                        <input type="email" v-model="memberForm.email" class="p-inputtext p-inputtext-sm" />
                    </div>
                </div>

                <div class="btn-group">
                    <button type="button" class="cancel-btn" @click="router.back()">취소</button>
                    <button type="submit" class="submit-btn">정보 저장</button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* 1. 전체 배경 */
.content-wrapper {
    display: flex !important;
    justify-content: center;
    align-items: flex-start;
    width: 100%;
    padding: 0px 0 30px 0;
    background-color: #f8fafc;
}

/* 2. 메인 카드 상자 */
.content-wrapper .form-container {
    width: 100%;
    max-width: 600px;
    padding: 2rem !important;
    border-radius: 16px !important;
    background-color: #ffffff !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05) !important;
}

/* 3. 제목 스타일 */
.content-wrapper .form-title {
    font-size: 1.4rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 1.5rem;
    color: #1e293b;
}

/* ⭐ sub-title에서 border-bottom을 제거하여 중복 방지 */
.content-wrapper .form-container .sub-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 2.5rem 0 0.5rem 0 !important;
    color: #334155;
    border-bottom: none !important; /* 기존 선 제거 */
    padding-bottom: 0 !important;
}

/* ⭐ 새로 만든 물리적인 구분선 스타일 */
.title-line {
    width: 100%;
    height: 2px;
    background-color: #f1f5f9;
    margin-bottom: 1.5rem;
}

/* 4. 그리드 및 입력창 레이아웃 */
.content-wrapper .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem 1.5rem;
    margin-bottom: 1rem;
}

.content-wrapper .input-set {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.content-wrapper label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #64748b;
}

.full-width {
    grid-column: span 2;
}

/* 5. 주소 및 비밀번호 영역 */
.content-wrapper .address-group,
.content-wrapper .password-flex-column {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

/* 우편번호 버튼 */
.post-btn {
    padding: 0.5rem 1rem;
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    color: #64748b;
    font-size: 0.85rem;
    cursor: pointer;
}

/* 6. 하단 버튼 그룹 */
.content-wrapper .btn-group {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
}

.content-wrapper .submit-btn,
.content-wrapper .cancel-btn {
    flex: 1;
    padding: 0.8rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
}

.content-wrapper .submit-btn {
    background-color: #10b981;
    color: white;
    border: none;
}

.content-wrapper .cancel-btn {
    background-color: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
}

/* 7. PrimeVue 입력창 스타일 고정 */
:deep(.p-inputtext) {
    padding: 0.5rem 0.75rem !important;
    border-radius: 8px !important;
    font-size: 0.9rem !important;
}

:deep(.p-inputtext:disabled) {
    background-color: #f8fafc !important;
    border-color: #f1f5f9 !important;
    color: #94a3b8 !important;
}
</style>
