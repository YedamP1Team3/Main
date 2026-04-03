<script setup>
// 1. 필요한 도구들을 가져오는 단계
import { ref, onMounted } from 'vue'; // 반응형 데이터(ref)와 시작 시 실행 함수(onMounted)
import { useRouter } from 'vue-router'; // 페이지 이동을 위한 도구
import { useAuthStore } from '@/stores/auth'; // 로그인 상태(ID 등) 확인용 창고
import axios from 'axios'; // 서버와 통신하기 위한 도구

const router = useRouter(); // 페이지 이동 기능을 변수에 담습니다.
const authStore = useAuthStore(); // 로그인 정보 창고를 사용할 준비를 합니다.

// 2. 화면의 입력창들과 연결될 '데이터 바구니' (사용자 정보 객체)
const memberForm = ref({
    name: '', // 이름
    id: '', // 아이디
    currentPassword: '', // 본인 확인용 현재 비밀번호
    newPassword: '', // 새로 바꿀 비밀번호
    confirmPassword: '', // 새 비밀번호 확인 입력
    agencyRegion: '', // 소속 지역
    agencyName: '', // 기관(센터) 이름
    postcode: '', // 우편번호
    address: '', // 기본 주소
    detailAddress: '', // 상세 주소
    phone: '', // 전화번호
    email: '' // 이메일
});

// 3. [주소 찾기] 카카오 주소 API 팝업을 실행하는 함수
const openPostcode = () => {
    new window.daum.Postcode({
        oncomplete: (data) => {
            // 사용자가 선택한 주소 타입(도로명/지번)에 따라 값을 가져옵니다.
            let fullAddr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;

            memberForm.value.address = fullAddr; // 주소 칸에 자동 입력
            memberForm.value.postcode = data.zonecode; // 우편번호 칸에 자동 입력

            // 주소 입력이 끝나면 '상세주소' 칸으로 커서를 자동으로 옮겨줍니다.
            const detailInput = document.querySelector('input[placeholder="상세주소를 입력하세요"]');
            if (detailInput) detailInput.focus();
        }
    }).open(); // 팝업창 열기
};

// 4. [조회] 페이지가 열리자마자 기존 내 정보를 불러와서 화면에 채워줍니다.
onMounted(async () => {
    if (authStore.userId) {
        // 로그인한 아이디가 있다면 실행
        try {
            // 서버에 "내 상세 정보를 보내줘"라고 요청(GET)합니다.
            const response = await axios.get(`/api/info/user-detail/${authStore.userId}`);
            const data = response.data;

            // [매칭] 서버 DB의 이름표(user_id 등)를 화면의 이름표(id 등)와 연결하여 채웁니다.
            memberForm.value.id = data.user_id;
            memberForm.value.name = data.user_name;
            memberForm.value.phone = data.tel;
            memberForm.value.email = data.email;
            memberForm.value.postcode = data.zip_code;
            memberForm.value.address = data.address;
            memberForm.value.detailAddress = data.detail_address;

            // 소속 기관 정보도 함께 채워줍니다.
            memberForm.value.agencyRegion = data.region;
            memberForm.value.agencyName = data.agency_name;
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            alert('정보를 불러오는 중 오류가 발생했습니다.');
        }
    } else {
        // 로그인 정보가 없으면 로그인 페이지로 돌려보냅니다.
        alert('로그인 정보가 없습니다.');
        router.push({ name: 'loginForm' });
    }
});

// 5. [저장] '수정 완료' 버튼을 눌렀을 때 실행되는 함수
const saveInfo = async () => {
    // [검사] 새 비밀번호를 두 번 입력했을 때 서로 똑같은지 확인합니다.
    if (memberForm.value.newPassword !== memberForm.value.confirmPassword) {
        alert('새 비밀번호와 확인 값이 일치하지 않습니다.');
        return; // 다르면 여기서 멈춤!
    }

    try {
        // 서버의 수정 전용 주소로 바구니(memberForm)에 담긴 데이터를 보냅니다 (PUT).
        const response = await axios.put('/api/info/update-user', memberForm.value);

        // 서버 응답이 성공(success 또는 200번 코드)이라면 처리합니다.
        if (response.data && (response.data.status === 'success' || response.status === 200)) {
            authStore.updateName(memberForm.value.name);
            alert('수정 완료 !');
            router.push({ name: 'myInfo' }); // 수정 후 내 정보 확인 페이지로 이동
        } else {
            console.warn('응답 조건 미달:', response.data);
        }
    } catch (error) {
        console.error('수정 에러 상세:', error);
        alert('수정 중 오류가 발생했습니다.');
    }
};
</script>

<template>
    <div class="content-wrapper">
        <div class="card form-container shadow-2">
            <h5 class="form-title">내 정보 수정</h5>

            <form @submit.prevent="saveInfo" class="p-fluid">
                <div class="input-set">
                    <label>이름</label>
                    <InputText v-model="memberForm.name" class="p-inputtext-sm" />
                </div>

                <div class="input-set">
                    <label>아이디</label>
                    <InputText v-model="memberForm.id" class="p-inputtext-sm disabled-input" disabled autocomplete="username" />
                </div>

                <div class="password-section mt-4">
                    <h3 class="sub-title">비밀번호 변경</h3>
                    <div class="title-line"></div>

                    <div class="input-set">
                        <label>현재 비밀번호</label>
                        <InputText type="password" v-model="memberForm.currentPassword" autocomplete="current-password" placeholder="기존 비밀번호를 입력하세요" class="p-inputtext-sm" />
                    </div>
                    <div class="input-set">
                        <label>새 비밀번호</label>
                        <InputText type="password" v-model="memberForm.newPassword" autocomplete="new-password" placeholder="새 비밀번호 입력" class="p-inputtext-sm" />
                    </div>
                    <div class="input-set">
                        <label>새 비밀번호 확인</label>
                        <InputText type="password" v-model="memberForm.confirmPassword" autocomplete="new-password" placeholder="새 비밀번호 재입력" class="p-inputtext-sm" />
                    </div>
                </div>

                <div class="extra-section mt-4">
                    <h3 class="sub-title">추가 정보</h3>
                    <div class="title-line"></div>

                    <div class="input-set">
                        <label>소속 기관</label>
                        <div class="flex gap-2">
                            <InputText v-model="memberForm.agencyRegion" placeholder="지역" class="p-inputtext-sm flex-1" />
                            <InputText v-model="memberForm.agencyName" placeholder="센터명" class="p-inputtext-sm flex-2" />
                        </div>
                    </div>

                    <div class="input-set address-section">
                        <label>주소</label>
                        <div class="flex gap-2 mb-2">
                            <InputText v-model="memberForm.postcode" placeholder="우편번호" readonly class="p-inputtext-sm w-6rem" />
                            <button type="button" class="post-btn" @click="openPostcode">우편번호 검색</button>
                        </div>
                        <InputText v-model="memberForm.address" placeholder="기본 주소" class="mb-2 p-inputtext-sm" readonly />
                        <InputText v-model="memberForm.detailAddress" placeholder="상세 주소를 입력하세요" class="p-inputtext-sm" />
                    </div>

                    <div class="input-set">
                        <label>전화번호</label>
                        <InputText v-model="memberForm.phone" class="p-inputtext-sm" />
                    </div>

                    <div class="input-set mb-4">
                        <label>이메일 주소</label>
                        <InputText v-model="memberForm.email" class="p-inputtext-sm" />
                    </div>
                </div>

                <div class="btn-group gap-3">
                    <Button label="취 소" type="button" class="p-button-secondary cancel-btn" @click="router.back()" />
                    <Button label="정보 저장" type="submit" class="p-button-success submit-btn" />
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.content-wrapper {
    display: flex !important;
    justify-content: center;
    align-items: flex-start;
    width: 100%;
    /* 상단 패딩을 10px에서 5px로 줄여 카드를 위로 올림 */
    padding: 5px 0 40px 0;
    background-color: #fef9f6 !important;
}

.form-container {
    width: 100%;
    max-width: 550px;
    background-color: #ffffff;
    /* 상단 내부 패딩을 1.5rem에서 1.2rem으로 줄여 제목을 위로 올림 */
    padding: 1.2rem 2rem !important;
    border-radius: 12px;
    border: 2px solid #f4e2de;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.form-title {
    font-size: 1.3rem;
    font-weight: bold;
    text-align: center;
    /* 제목 아래 간격도 살짝 줄임 */
    margin-bottom: 1.2rem;
    color: #334155;
}

/* 섹션(비밀번호 변경, 추가 정보) 제목 스타일 */
.sub-title {
    font-size: 1.05rem;
    font-weight: 700;
    margin-bottom: 0.4rem;
    color: #334155;
}

.title-line {
    width: 100%;
    height: 1px;
    background-color: #f1f5f9;
    margin-bottom: 1rem;
}

.input-set {
    display: flex;
    flex-direction: column;
    margin-bottom: 0.8rem;
}

.input-set label {
    font-weight: 600;
    margin-bottom: 0.3rem;
    font-size: 0.85rem;
    color: #475569;
}

.post-btn {
    background-color: #fef9f6;
    border: 2px solid #f4e2de;
    color: #ffab91;
    padding: 0 0.8rem;
    border-radius: 6px;
    font-size: 0.8rem;
    cursor: pointer;
    white-space: nowrap;
}

.btn-group {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
}

.submit-btn,
.cancel-btn {
    flex: 1;
    padding: 0.6rem;
    font-size: 0.95rem;
    font-weight: bold;
}

.submit-btn {
    background-color: #ffab91 !important;
    border: none;
}

.disabled-input {
    background-color: #f1f5f9 !important;
    border-color: #e2e8f0 !important;
    color: #64748b !important;
    cursor: not-allowed !important;
}

:deep(.p-inputtext-sm) {
    padding: 0.4rem 0.7rem;
}

/* 섹션 간의 상단 여백 조절 */
.mt-4 {
    margin-top: 1.2rem !important; /* 1.5에서 1.2로 축소 */
}
</style>
