<script setup>
// 1. 필요한 도구들을 외부에서 가져오는 단계 (임포트)
import { ref, onMounted } from 'vue'; // Vue의 핵심 기능: 반응형 데이터(ref), 시작 시 실행 함수(onMounted)
import { useRouter } from 'vue-router'; // 페이지를 이동시키는 도구 (예: 저장 후 목록으로 가기)
import { useAuthStore } from '@/stores/auth'; // 로그인한 사람의 정보(ID 등)가 저장된 창고
import axios from 'axios'; // 서버와 데이터를 주고받는 통신 도구

const router = useRouter(); // 페이지 이동 도구 사용 준비
const authStore = useAuthStore(); // 로그인 정보 창고 사용 준비

// 2. 화면의 입력창들과 연결될 '데이터 바구니' 만들기 (반응형 변수)
const managerForm = ref({
    name: '', // 이름 입력칸과 연결
    id: '', // 아이디 (수정 불가용)
    currentPassword: '', // [중요] 본인 확인을 위해 입력받을 현재 비밀번호
    newPassword: '', // 새로 바꿀 비밀번호
    confirmPassword: '', // 비밀번호 확인 (두 번 입력)
    agencyRegion: '', // 지역
    agencyName: '', // 기관명
    postcode: '', // 우편번호
    address: '', // 주소
    detailAddress: '', // 상세주소
    phone: '', // 전화번호
    email: '' // 이메일
});

// 3. 주소 찾기 기능 (카카오/다음 우편번호 서비스 연동)
const openPostcode = () => {
    new window.daum.Postcode({
        oncomplete: (data) => {
            // 사용자가 선택한 주소 종류에 따라 주소값을 가져옵니다.
            let fullAddr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
            managerForm.value.address = fullAddr; // 주소창에 자동 입력
            managerForm.value.postcode = data.zonecode; // 우편번호창에 자동 입력

            // 주소 입력이 끝나면 '상세주소' 칸으로 커서를 옮겨줍니다.
            const detailInput = document.querySelector('input[placeholder="상세주소를 입력하세요"]');
            if (detailInput) detailInput.focus();
        }
    }).open(); // 주소 팝업창 열기
};

// 4. [조회] 페이지가 열리자마자 서버에서 내 정보를 가져오는 단계
onMounted(async () => {
    if (authStore.userId) {
        // 로그인한 아이디가 있다면
        try {
            // 서버에 "내 아이디 줄게, 정보 다 보내줘"라고 요청(GET)합니다.
            const response = await axios.get(`/api/mgmypage/${authStore.userId}`);
            const data = response.data.profile; // 서버가 보내준 데이터 중 프로필만 쏙!

            // 서버에서 받은 정보들을 화면의 각 입력창(managerForm)에 채워넣습니다.
            managerForm.value.name = data.name;
            managerForm.value.id = data.userId;
            managerForm.value.phone = data.phone;
            managerForm.value.email = data.email;
            managerForm.value.postcode = data.zip_code || '';
            managerForm.value.address = data.address || '';
            managerForm.value.detailAddress = data.detail_address || '';
            managerForm.value.agencyName = data.institution || '';
        } catch (error) {
            console.error('담당자 데이터 로드 실패:', error);
            alert('정보를 불러오는 중 오류가 발생했습니다.');
        }
    } else {
        // 로그인 정보가 없으면 내쫓습니다.
        alert('로그인 정보가 없습니다.');
        router.push({ name: 'loginForm' });
    }
});

// 5. [저장] 사용자가 수정한 내용을 서버에 보내는 단계
const saveInfo = async () => {
    // [검사 1] 새 비밀번호를 입력했는데, 확인 입력값과 다르다면 중단!
    if (managerForm.value.newPassword !== managerForm.value.confirmPassword) {
        alert('새 비밀번호와 확인 값이 일치하지 않습니다.');
        return;
    }

    try {
        // [검사 2] 서버가 원하는 이름표(Key)를 붙여서 데이터를 포장합니다.
        const updateData = {
            userId: managerForm.value.id,
            user_name: managerForm.value.name,
            tel: managerForm.value.phone,
            email: managerForm.value.email,
            postcode: managerForm.value.postcode,
            address: managerForm.value.address,
            detailAddress: managerForm.value.detailAddress,
            currentPassword: managerForm.value.currentPassword, // 현재 비번 (본인 확인용)
            newPassword: managerForm.value.newPassword // 새 비번 (수정용)
        };

        // 서버의 '수정 성문(Router)'으로 포장한 데이터를 보냅니다 (PUT 방식).
        const response = await axios.put('/api/mgmypage/update', updateData);

        if (response.status === 200) {
            authStore.updateName(managerForm.value.name);

            authStore.$patch({
                userName: managerForm.value.name
            });

            // 서버가 "오케이, 수정 완료!"라고 응답(200)하면
            alert('정보가 성공적으로 수정되었습니다.');
            router.push({ name: 'managerInfo' }); // 수정한 내용을 확인하는 페이지로 이동
        }
    } catch (error) {
        // 만약 서버에서 "현재 비번 틀렸어!" 같은 에러를 보내면 사용자에게 보여줍니다.
        console.error('수정 에러 상세:', error.response?.data || error);
        alert(error.response?.data?.message || '수정 중 오류가 발생했습니다.');
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
                    <InputText v-model="managerForm.name" class="p-inputtext-sm" />
                </div>

                <div class="input-set">
                    <label>아이디</label>
                    <InputText v-model="managerForm.id" class="p-inputtext-sm disabled-input" disabled autocomplete="username" />
                </div>

                <div class="password-section mt-4">
                    <h3 class="sub-title">비밀번호 변경</h3>
                    <div class="title-line"></div>
                    <div class="input-set">
                        <label>현재 비밀번호</label>
                        <InputText type="password" v-model="managerForm.currentPassword" autocomplete="current-password" placeholder="기존 비밀번호를 입력하세요" class="p-inputtext-sm" />
                    </div>
                    <div class="input-set">
                        <label>새 비밀번호</label>
                        <InputText type="password" v-model="managerForm.newPassword" autocomplete="new-password" placeholder="새 비밀번호 입력" class="p-inputtext-sm" />
                    </div>
                    <div class="input-set">
                        <label>새 비밀번호 확인</label>
                        <InputText type="password" v-model="managerForm.confirmPassword" autocomplete="new-password" placeholder="새 비밀번호 재입력" class="p-inputtext-sm" />
                    </div>
                </div>

                <div class="extra-section mt-4">
                    <h3 class="sub-title">추가 정보</h3>
                    <div class="title-line"></div>

                    <div class="input-set">
                        <label>소속 기관</label>
                        <div class="flex gap-2">
                            <InputText v-model="managerForm.agencyRegion" placeholder="지역" class="p-inputtext-sm flex-1" />
                            <InputText v-model="managerForm.agencyName" placeholder="센터명" class="p-inputtext-sm flex-2" />
                        </div>
                    </div>

                    <div class="input-set address-section">
                        <label>주소</label>
                        <div class="flex gap-2 mb-2">
                            <InputText v-model="managerForm.postcode" placeholder="우편번호" readonly class="p-inputtext-sm w-6rem" />
                            <button type="button" class="post-btn" @click="openPostcode">우편번호 검색</button>
                        </div>
                        <InputText v-model="managerForm.address" placeholder="기본 주소" class="mb-2 p-inputtext-sm" readonly />
                        <InputText v-model="managerForm.detailAddress" placeholder="상세 주소를 입력하세요" class="p-inputtext-sm" />
                    </div>

                    <div class="input-set">
                        <label>전화번호</label>
                        <InputText v-model="managerForm.phone" class="p-inputtext-sm" />
                    </div>

                    <div class="input-set mb-4">
                        <label>이메일 주소</label>
                        <InputText v-model="managerForm.email" class="p-inputtext-sm" />
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
