<script setup>
// 1. 필요한 도구들을 가져오는 단계
import axios from 'axios'; // 서버와 통신하기 위한 도구
import { ref, watch, onMounted } from 'vue'; // 반응형 데이터, 감시자, 시작 시 실행 함수
import { useAuthStore } from '@/stores/auth'; // 로그인 정보를 보관 중인 창고(Pinia)
import { useRouter } from 'vue-router'; // 페이지 이동을 위한 도구

const router = useRouter(); // 라우터 사용 준비
const authStore = useAuthStore(); // 로그인 정보 창고 사용 준비

// 2. 화면의 입력창들과 연결될 '데이터 바구니' (대상자 정보)
const form = ref({
    name: '', // 대상자 성함
    birth: '', // 생년월일 (8자리)
    gender: '여성', // 성별 (기본값 여성)
    zipCode: '', // 우편번호
    addr1: '', // 기본 주소
    addr2: '', // 상세 주소
    disabilityType: null, // 장애 유형 (선택)
    relation: '부모', // 신청자와의 관계 (기본값 부모)
    relationEtc: '', // 관계가 '기타'일 때 직접 입력할 내용
    file: null // 증빙 서류 파일
});

// 3. [초기 설정] 페이지가 열리면 로그인한 사용자의 주소를 미리 채워줍니다.
onMounted(async () => {
    // 창고(Pinia)에 이미 내 주소가 저장되어 있다면 바로 사용합니다.
    if (authStore.userZip && authStore.userAddr1) {
        form.value.zipCode = authStore.userZip;
        form.value.addr1 = authStore.userAddr1;
        form.value.addr2 = authStore.userAddr2;
    } else if (authStore.userId) {
        // 창고가 비어있다면 서버에 내 주소를 직접 물어봐서 가져옵니다.
        try {
            const response = await axios.get(`/api/info/user-detail/${authStore.userId}`);
            const user = response.data;
            form.value.zipCode = user.zip_code;
            form.value.addr1 = user.address;
            form.value.addr2 = user.detail_address;
        } catch (error) {
            console.error('주소 정보를 불러오지 못했습니다.', error);
        }
    }
});

// 4. [옵션 리스트] 선택창(Select)이나 라디오 버튼에 보여줄 항목들
const disabilityOptions = ['지체장애', '시각장애', '청각장애', '지적장애', '뇌병변장애', '기타'];
const relations = ['부모', '배우자', '자녀', '친족', '후견인', '기타'];

// 5. [주소 검색] 카카오 주소 API 팝업창을 실행합니다.
const openPostcode = () => {
    new window.daum.Postcode({
        oncomplete: (data) => {
            let fullAddress = data.roadAddress || data.jibunAddress; // 선택한 주소
            let extraAddress = '';

            if (data.userSelectedType === 'R') {
                // 도로명 주소일 때 참고항목 조합
                if (data.bname !== '') extraAddress += data.bname;
                if (data.buildingName !== '') extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
                fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
            }

            form.value.zipCode = data.zonecode; // 우편번호 저장
            form.value.addr1 = fullAddress; // 주소 저장
            document.getElementById('addr2')?.focus(); // 상세주소 칸으로 커서 이동
        }
    }).open();
};

// 6. [파일 선택] 서류를 선택하면 바구니(form.file)에 담습니다.
const onFileSelect = (event) => {
    form.value.file = event.files[0];
};

// 7. [등록 버튼] 모든 정보를 서버로 전송하는 메인 함수
const submitForm = async () => {
    // [검사] 필수 입력 항목들이 비어있거나 틀렸는지 확인합니다.
    if (!form.value.name.trim()) {
        alert('대상자 성명을 입력해 주세요.');
        return;
    }
    if (!form.value.birth || form.value.birth.length !== 8) {
        alert('생년월일 8자리를 정확히 입력해 주세요.');
        return;
    }
    if (!form.value.disabilityType) {
        alert('장애유형을 선택해 주세요.');
        return;
    }
    if (form.value.relation === '기타' && !form.value.relationEtc.trim()) {
        alert('관계를 직접 입력해 주세요.');
        return;
    }

    try {
        const userId = authStore.userId; // 현재 로그인한 사람의 ID
        if (!userId) {
            alert('로그인 정보가 없습니다.');
            return;
        }

        const genderCode = form.value.gender === '남성' ? 'M' : 'F'; // 성별을 코드(M/F)로 변환

        // 서버로 보낼 최종 데이터를 예쁘게 포장합니다.
        const sendData = {
            ...form.value, // 입력한 모든 내용 복사
            gender: genderCode,
            family_id: userId // 누구의 대상자인지 알려주기 위해 내 ID를 붙임
        };

        // 서버의 등록 주소로 데이터를 전송(POST)합니다.
        const response = await axios.post('/api/recipient/register', sendData);

        if (response.data.success) {
            alert('대상자가 성공적으로 등록되었습니다.');
            router.push({ name: 'mApplication' }); // 성공 시 신청 페이지로 이동
        }
    } catch (error) {
        console.error('Error:', error);
        alert('등록 중 오류 발생');
    }
};

// 8. [감시자] 관계를 '기타'에서 다른 것으로 바꾸면, 직접 입력했던 내용을 지워줍니다.
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
                    <label>대상자 성명 <small class="text-red-500">* 필수</small></label>
                    <InputText v-model="form.name" placeholder="실명을 입력하세요" class="p-inputtext-sm" />
                </div>

                <div class="input-set">
                    <label>생 년 월 일 <small class="text-red-500">* 필수</small></label>
                    <InputText v-model="form.birth" placeholder="예) 19900101" maxlength="8" class="p-inputtext-sm" />
                </div>

                <div class="input-set">
                    <label>성 별 <small class="text-red-500">* 필수</small></label>
                    <div class="flex gap-4 p-1">
                        <div class="flex align-items-center"><RadioButton v-model="form.gender" inputId="f" value="여성" /><label for="f" class="ml-2 text-sm">여성</label></div>
                        <div class="flex align-items-center"><RadioButton v-model="form.gender" inputId="m" value="남성" /><label for="m" class="ml-2 text-sm">남성</label></div>
                    </div>
                </div>

                <div class="input-set address-section">
                    <label>주소 <small class="notice ml-2">(회원 정보와 동일)</small></label>

                    <div class="flex gap-2 mb-2">
                        <InputText v-model="form.zipCode" placeholder="우편번호" readonly class="p-inputtext-sm w-6rem disabled-input" />
                    </div>

                    <InputText v-model="form.addr1" placeholder="기본 주소" class="mb-2 p-inputtext-sm disabled-input" readonly />

                    <InputText v-model="form.addr2" placeholder="상세 주소" class="p-inputtext-sm disabled-input" readonly />

                    <p class="text-xs mt-2 text-500">※ 주소지는 본인 주소로 자동 설정되며, 마이페이지에서 변경 가능합니다.</p>
                </div>

                <div class="input-set">
                    <label>장애유형 <small class="text-red-500">* 필수</small></label>
                    <Select v-model="form.disabilityType" :options="disabilityOptions" placeholder="선택하세요" class="p-select-sm" />
                </div>

                <div class="input-set">
                    <label>대상자와의 관계 <small class="text-red-500">* 필수</small></label>
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
.form-container {
    width: 100%;
    max-width: 550px;
    background-color: #ffffff;
    padding: 2rem !important;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); /* 그림자 살짝 */

    /* ⭐ 이중 스크롤 방지 핵심 설정 (중복 없이 한 번만) */
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
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
    white-space: nowrap; /* 글자 줄바꿈 방지 */
    cursor: pointer;
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

/* [추가] 사진처럼 입력 불가한 느낌을 주는 전용 스타일 */
.disabled-input {
    background-color: #f1f5f9 !important; /* [설명] 사진처럼 살짝 어두운 배경색 적용 */
    border-color: #e2e8f0 !important; /* [설명] 테두리 색상을 연하게 조절 */
    color: #64748b !important; /* [설명] 글자색을 흐리게 변경 */
    cursor: not-allowed !important; /* [설명] 마우스 커서를 금지 모양으로 변경 */
    pointer-events: none; /* [설명] 클릭이나 포커스 이벤트를 완전히 차단 */
}

.text-500 {
    color: #64748b;
}
.text-xs {
    font-size: 0.75rem;
}
.mt-2 {
    margin-top: 0.5rem;
}

/* 2. 상자를 감싸는 영역도 밖으로 내용이 나가게 허용합니다 */
.content-wrapper {
    display: flex !important; /* block 대신 flex 유지 */
    justify-content: center; /* 가로 중앙 정렬 */
    align-items: flex-start; /* 내용이 길면 위에서부터 시작 */
    width: 100%;
    padding: 10px 0 40px 0;
    min-height: auto !important;
    height: auto !important;
    overflow: visible !important; /* 스크롤 방해 금지 */
    background-color: #f8fafc;
}
</style>
