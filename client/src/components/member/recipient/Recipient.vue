<script setup>
import axios from 'axios';
import { ref, watch } from 'vue';

// [상태] 입력 폼 데이터 (zipCode, addr1은 API로 채워질 예정)
const form = ref({
    name: '',
    birth: '',
    gender: '여성',
    zipCode: '',
    addr1: '',
    addr2: '',
    disabilityType: null,
    relation: '부모', // 기본값
    relationEtc: '', // 기타 입력내용
    file: null
});

// [옵션] 장애유형
const disabilityOptions = ['지체장애', '시각장애', '청각장애', '지적장애', '뇌병변장애', '기타'];
// [옵션] 대상자와의 관계
const relations = ['부모', '배우자', '자녀', '친족', '후견인', '기타'];

const openPostcode = () => {
    new window.daum.Postcode({
        oncomplete: (data) => {
            // 도로명 주소와 지번 주소 중 우선순위에 따라 주소 설정
            let fullAddress = data.roadAddress || data.jibunAddress;
            let extraAddress = '';

            // 도로명 주소일 경우 참고항목(법정동, 건물명) 조합
            if (data.userSelectedType === 'R') {
                if (data.bname !== '') extraAddress += data.bname;
                if (data.buildingName !== '') extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
                fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
            }

            // [데이터 바인딩] 우편번호와 주소를 form 객체에 저장
            form.value.zipCode = data.zonecode;
            form.value.addr1 = fullAddress;

            // 주소 입력 후 상세주소 필드로 포커스 이동 (선택 사항)
            document.getElementById('addr2')?.focus();
        }
    }).open();
};

// 관계가 '기타'가 아니게 되면 입력했던 기타 내용을 초기화

const onFileSelect = (event) => {
    form.value.file = event.files[0];
};

const submitForm = async () => {
    try {
        // 1. 로컬스토리지나 Store에 저장된 로그인 유저 정보를 가져온다.
        const userInfo = JSON.parse(localStorage.getItem('user'));
        const userId = userInfo ? userInfo.id : null;

        if (!userId) {
            alert('로그인 정보가 없습니다. 다시 로그인 해주세요');
            return;
        }

        // 2. 기존 form 데이터에 family_id를 추가하여 전송한다.
        const sendData = {
            ...form.value,
            family_id: userId // 서버의 family_id 컬럼으로 들어갈 값
        };
        const response = await axios.post('/recipient/register', sendData);

        if (response.data.success) {
            alert('대상자가 성공적으로 등록되었습니다.');
        }
    } catch (error) {
        alert('등록 중 오류 발생');
    }
};
watch(
    () => form.value.relation,
    (newVal) => {
        if (newVal !== '기타') {
            form.value.relationEtc = '';
        }
    }
);
</script>

<template>
    <div class="content-wrapper">
        <div class="card form-container shadow-2">
            <h5 class="form-title">지원대상자 추가</h5>

            <div class="p-fluid">
                <div class="input-set">
                    <label>대상자 성명</label>
                    <InputText v-model="form.name" placeholder="실명을 입력하세요" class="p-inputtext-sm" />
                </div>

                <div class="input-set">
                    <label>생 년 월 일</label>
                    <InputText v-model="form.birth" placeholder="예) 19900101" maxlength="8" class="p-inputtext-sm" />
                </div>

                <div class="input-set">
                    <label>성 별</label>
                    <div class="flex gap-4 p-1">
                        <div class="flex align-items-center"><RadioButton v-model="form.gender" inputId="f" value="여성" /><label for="f" class="ml-2 text-sm">여성</label></div>
                        <div class="flex align-items-center"><RadioButton v-model="form.gender" inputId="m" value="남성" /><label for="m" class="ml-2 text-sm">남성</label></div>
                    </div>
                </div>

                <div class="input-set address-section">
                    <label>주소</label>
                    <div class="flex gap-2 mb-1">
                        <InputText v-model="form.zipCode" placeholder="우편번호" readonly class="p-inputtext-sm" />
                        <button type="button" class="post-btn" @click="openPostcode">우편번호 검색</button>
                    </div>
                    <InputText v-model="form.addr1" placeholder="기본 주소" class="mb-1 p-inputtext-sm" readonly />
                    <InputText id="addr2" v-model="form.addr2" placeholder="상세 주소를 입력하세요" class="p-inputtext-sm" />
                </div>

                <div class="input-set">
                    <label>장애유형</label>
                    <Select v-model="form.disabilityType" :options="disabilityOptions" placeholder="선택하세요" class="p-select-sm" />
                </div>

                <div class="input-set">
                    <label>대상자와의 관계</label>
                    <div class="flex flex-wrap align-items-center gap-x-3 gap-y-2 p-1">
                        <div v-for="rel in relations" :key="rel" class="flex align-items-center">
                            <RadioButton v-model="form.relation" :inputId="rel" :value="rel" />
                            <label :for="rel" class="ml-1 text-sm">{{ rel }}</label>

                            <InputText v-if="rel === '기타'" v-model="form.relationEtc" placeholder="직접 입력" class="p-inputtext-sm etc-input" :disabled="form.relation !== '기타'" />
                        </div>
                    </div>
                </div>

                <div class="input-set mb-4">
                    <label>증빙 서류 첨부 <small class="notice ml-2">(3개월 이내)</small></label>
                    <FileUpload mode="basic" chooseLabel="파일 선택" class="p-button-secondary p-button-sm w-full" @select="onFileSelect" />
                </div>

                <div class="btn-group">
                    <Button label="등 록" class="p-button-success submit-btn" @click="submitForm" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.content-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 50px 0;
    min-height: calc(100vh - 150px);
}
.form-container {
    width: 100%;
    max-width: 500px;
    padding: 2rem !important;
    border-radius: 12px;
}
.form-title {
    font-size: 1.4rem;
    font-weight: bold;
    text-align: center;
    margin-bottom: 1.8rem;
    color: #334155;
}
.input-set {
    display: flex;
    flex-direction: column;
    margin-bottom: 0.9rem;
}
.input-set label {
    font-weight: 600;
    margin-bottom: 0.4rem;
    font-size: 0.9rem;
    color: #475569;
}
.post-btn {
    background: white;
    border: 1px solid #10b981;
    color: #10b981;
    padding: 0 1rem;
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: 0.2s;
}
.post-btn:hover {
    background: #f0fdf4;
}
.notice {
    color: #ef4444;
    font-weight: normal;
}
.btn-group {
    display: flex;
    justify-content: center;
}
.submit-btn {
    width: 100%;
    padding: 0.7rem;
    font-size: 1rem;
    font-weight: bold;
    background-color: #10b981;
    border: none;
}
:deep(.p-inputtext-sm) {
    padding: 0.5rem 0.75rem;
}
/* 비활성화 상태의 입력창 스타일 */
:deep(.p-inputtext:disabled) {
    background-color: #f8fafc;
    opacity: 0.6;
}
/* 기타 입력창 너비 조절 및 미세 정렬 */
.etc-input {
    width: 120px !important; /* 너무 길지 않게 고정 */
    margin-left: 4px;
    height: 32px; /* 라디오 버튼 높이와 맞춤 */
}

/* 비활성화 시 스타일 */
:deep(.p-inputtext:disabled) {
    background-color: #f1f5f9;
    border-color: #e2e8f0;
}
</style>
