<script setup>
// 외부 라이브러리나 다른 파일에서 필요한 기능들을 불러오는 단계입니다.
import { ref, onMounted } from 'vue'; // Vue에서 반응형 데이터(ref)와 화면이 뜰 때 실행할 함수(onMounted)를 가져옵니다.
import { useRouter } from 'vue-router'; // 페이지 이동을 제어하는 라우터 기능을 가져옵니다.
import { useAuthStore } from '@/stores/auth'; // 로그인 상태(ID 등)를 관리하는 저장소(Pinia 등)를 가져옵니다.
import axios from 'axios'; // 서버와 통신하기 위한 도구인 axios를 가져옵니다. (http)
import { manager } from '@/router/manager'; // 매니저 관련 라우트 정보를 가져옵니다 (여기선 직접 사용되지 않음).

const router = useRouter(); // 페이지 이동을 위해 라우터 인스턴스를 생성합니다.
const authStore = useAuthStore(); // 로그인된 사용자 정보를 사용하기 위해 스토어를 실행합니다.

// 화면에 입력될 데이터들을 저장하는 바구니를 만드는 단계입니다.
// 관리자 정보를 담을 반응형 객체입니다. input 태그들과 연결될 데이터들입니다.
const managerForm = ref({
    name: '', // 이름
    id: '', // 아이디
    currentPassword: '', // 현재 비밀번호
    newPassword: '', // 새 비밀번호
    confirmPassword: '', // 새 비밀번호 확인
    agencyRegion: '', // 기관 지역
    agencyName: '', // 기관명
    postcode: '', // 우편번호
    address: '', // 주소
    detailAddress: '', // 상세주소
    phone: '', // 전화번호
    email: '' // 이메일
});

// 카카오(Daum) 주소 API를 사용하여 주소를 검색하는 기능입니다.
const openPostcode = () => {
    new window.daum.Postcode({
        // 카카오 주소찾기 팝업을 실행합니다.
        oncomplete: (data) => {
            // 사용자가 주소를 선택했을 때 실행되는 함수입니다.
            // 도로명 주소(R)인지 지번 주소인지 확인하여 변수에 담습니다.
            let fullAddr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;

            managerForm.value.address = fullAddr; // 선택한 주소를 입력창 데이터에 넣습니다.
            managerForm.value.postcode = data.zonecode; // 우편번호를 데이터에 넣습니다.

            // 상세주소를 입력하는 칸을 찾아 자동으로 커서(포커스)를 옮겨줍니다.
            const detailInput = document.querySelector('input[placeholder="상세주소를 입력하세요"]');
            if (detailInput) detailInput.focus();
        }
    }).open();
};

// 페이지가 처음 화면에 나타날 때(컴포넌트가 마운트될 때) 실행되는 코드입니다.
onMounted(async () => {
    if (authStore.userId) {
        // 로그인한 사용자의 ID가 있는지 확인합니다.
        try {
            // 서버에 해당 ID의 프로필 정보를 달라고 요청(GET)합니다.
            const response = await axios.get(`/api/mgmypage/${authStore.userId}`);
            const data = response.data.profile; // 서버에서 받아온 정보를 변수에 저장합니다.

            // 서버에서 받은 데이터를 화면에 보여줄 바구니(managerForm)에 하나씩 옮겨 담습니다.
            managerForm.value.name = data.name;
            managerForm.value.id = data.userId;
            managerForm.value.phone = data.phone;
            managerForm.value.email = data.email;
            managerForm.value.postcode = data.zip_code || '';
            managerForm.value.address = data.address || '';
            managerForm.value.detailAddress = data.detail_address || '';
            managerForm.value.agencyName = data.institution || '';
        } catch (error) {
            // 데이터를 가져오는데 실패했을 경우 에러 메시지를 띄웁니다.
            console.error('담당자 데이터 로드 실패:', error);
            alert('정보를 불러오는 중 오류가 발생했습니다.');
        }
    } else {
        // 로그인 정보가 없다면 경고창을 띄우고 로그인 페이지로 보냅니다.
        alert('로그인 정보가 없습니다.');
        router.push({ name: 'loginForm' });
    }
});

// '저장' 버튼을 눌렀을 때 실행되는 수정 로직입니다.
const saveInfo = async () => {
    // 1차 검사: 새 비밀번호와 확인용 비밀번호가 똑같은지 확인합니다.
    if (managerForm.value.newPassword !== managerForm.value.confirmPassword) {
        alert('새 비밀번호와 확인 값이 일치하지 않습니다.');
        return; // 일치하지 않으면 여기서 함수를 종료합니다.
    }

    try {
        // 서버로 보낼 데이터를 정리합니다. (서버가 요구하는 형식에 맞춰 이름을 맞춤)
        const updateData = {
            userId: managerForm.value.id,
            user_name: managerForm.value.name,
            tel: managerForm.value.phone,
            email: managerForm.value.email,
            postcode: managerForm.value.postcode,
            address: managerForm.value.address,
            detailAddress: managerForm.value.detailAddress,
            currentPassword: managerForm.value.currentPassword,
            newPassword: managerForm.value.newPassword
        };

        // 서버에 수정 요청(PUT)을 보냅니다.
        const response = await axios.put('/api/mgmypage/update', updateData);

        if (response.status === 200) {
            // 성공(200)했다면
            alert('정보가 성공적으로 수정되었습니다.');
            router.push({ name: 'managerInfo' }); // 정보 확인 페이지로 이동합니다.
        }
    } catch (error) {
        // 수정 실패 시 에러 내용을 콘솔에 찍고 사용자에게 이유를 알립니다.
        console.error('수정 에러 상세:', error.response?.data || error);
        alert(error.response?.data?.mmessage || '수정 중 오류가 발생했습니다.');
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
