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
    new window.daum.Postcode({
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
            // [설명] API 호출 시 '/api' 프록시 경로를 확인하여 호출합니다.
            const response = await axios.get(`/api/info/user-detail/${authStore.userId}`);
            const data = response.data;

            // [설명] 서버 DB 컬럼명에 맞춰 memberForm 객체에 데이터를 할당합니다.
            memberForm.value.id = data.user_id; // 아이디 할당
            memberForm.value.name = data.user_name; // 이름 할당
            memberForm.value.phone = data.tel; // DB의 tel을 phone에 매칭
            memberForm.value.email = data.email; // 이메일 할당
            memberForm.value.postcode = data.zip_code; // 우편번호 할당
            memberForm.value.address = data.address; // 기본 주소 할당
            memberForm.value.detailAddress = data.detail_address; // 상세 주소 할당

            // [설명] 소속 기관(지역, 센터명) 데이터를 폼에 채워줍니다.
            memberForm.value.agencyRegion = data.region; // DB의 region을 지역 필드에 할당
            memberForm.value.agencyName = data.agency_name; // DB의 agency_name을 센터명 필드에 할당
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
    if (memberForm.value.newPassword !== memberForm.value.confirmPassword) {
        alert('새 비밀번호와 확인 값이 일치하지 않습니다.');
        return;
    }

    try {
        const response = await axios.put('/api/info/update-user', memberForm.value);

        // 서버 응답을 확인하기 위한 로그 (개발자 도구에서 확인 가능)
        console.log('서버 응답:', response.data);

        // [수정] 응답 데이터가 존재하거나 success 관련 필드가 하나라도 true라면 실행
        if (response.data && (response.data.status === 'success' || response.data.success || response.status === 200)) {
            alert('수정 완료 !');
            router.push('/mypage/info');
        } else {
            // 응답은 왔으나 조건에 맞지 않는 경우
            console.warn('응답 조건 미달:', response.data);
            // 강제로라도 이동시키고 싶다면 아래 주석 해제
            // alert('수정 완료 !');
            // router.push('/mypage/info');
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

            <div class="p-fluid">
                <div class="input-set">
                    <label>이름</label>
                    <InputText v-model="memberForm.name" class="p-inputtext-sm" />
                </div>

                <div class="input-set">
                    <label>아이디</label>
                    <InputText v-model="memberForm.id" class="p-inputtext-sm disabled-input" disabled />
                </div>

                <div class="password-section mt-4">
                    <h3 class="sub-title">비밀번호 변경</h3>
                    <div class="title-line"></div>

                    <div class="input-set">
                        <label>현재 비밀번호</label>
                        <InputText type="password" v-model="memberForm.currentPassword" placeholder="기존 비밀번호를 입력하세요" class="p-inputtext-sm" />
                    </div>
                    <div class="input-set">
                        <label>새 비밀번호</label>
                        <InputText type="password" v-model="memberForm.newPassword" placeholder="새 비밀번호 입력" class="p-inputtext-sm" />
                    </div>
                    <div class="input-set">
                        <label>새 비밀번호 확인</label>
                        <InputText type="password" v-model="memberForm.confirmPassword" placeholder="새 비밀번호 재입력" class="p-inputtext-sm" />
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
                    <Button label="취 소" class="p-button-secondary cancel-btn" @click="router.back()" />
                    <Button label="정보 저장" class="p-button-success submit-btn" @click="saveInfo" />
                </div>
            </div>
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
    background-color: #f8fafc;
}

.form-container {
    width: 100%;
    max-width: 550px;
    background-color: #ffffff;
    /* 상단 내부 패딩을 1.5rem에서 1.2rem으로 줄여 제목을 위로 올림 */
    padding: 1.2rem 2rem !important;
    border-radius: 12px;
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
    background: white;
    border: 1px solid #10b981;
    color: #10b981;
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
    background-color: #10b981 !important;
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
