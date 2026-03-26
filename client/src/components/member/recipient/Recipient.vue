<script setup>
import axios from 'axios'; // http 통신을 위한 axios 임포트
import { ref, watch } from 'vue'; // Vue 반응형 객체 및 감시자 임포트
import { useAuthStore } from '@/stores/auth'; // 작성한 Auth(피니아) 스토어 임포트

// [상태] 입력 폼 데이터 정의
const form = ref({
    name: '', // 대상자 이름
    birth: '', // 생년월일
    gender: '여성', // 성별 (기본값 = 여성)
    zipCode: '', // 우편번호
    addr1: '', // 기본 주소
    addr2: '', // 상세 주소
    disabilityType: null, // 장애 유형
    relation: '부모', // 대상자와의 관계 (기본값 = 부모)
    relationEtc: '', // 관계 '기타'를 선택 시 입력값
    file: null // 첨부파일
});

// [상태] Pinia 스토어 인스턴스 생성
const authStore = useAuthStore(); // 로그인 정보를 담고 있는 스토어 호출

// [옵션] 장애유형 리스트
const disabilityOptions = ['지체장애', '시각장애', '청각장애', '지적장애', '뇌병변장애', '기타'];
// [옵션] 대상자와의 관계 리스트
const relations = ['부모', '배우자', '자녀', '친족', '후견인', '기타'];

// [함수] 주소 검색 API 팝업창 열기
const openPostcode = () => {
    new window.daum.Postcode({
        oncomplete: (data) => {
            // 도로명 주소와 지번 주소 중 우선순위에 따라 주소 설정
            let fullAddress = data.roadAddress || data.jibunAddress; // 주소 방식 선택
            let extraAddress = ''; // 참고 항목 변수

            // 도로명 주소일 경우 참고항목(법정동, 건물명) 조합
            if (data.userSelectedType === 'R') {
                // 도로명 주소 선택 시
                if (data.bname !== '') extraAddress += data.bname; // 법정동 추가
                if (data.buildingName !== '') extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName; // 건물명 추가
                fullAddress += extraAddress !== '' ? ` (${extraAddress})` : ''; // 최종 주소 조합
            }

            // [데이터 바인딩] 우편번호와 주소를 form 객체에 저장
            form.value.zipCode = data.zonecode; // 우편번호 저장
            form.value.addr1 = fullAddress; // 기본 주소 저장

            // 주소 입력 후 상세주소 필드로 포커스 이동 (선택 사항)
            document.getElementById('addr2')?.focus(); // 상세주소 입력창으로 포커스 이동
        }
    }).open();
};

// [함수] 파일 선택 시 상태 업데이트
const onFileSelect = (event) => {
    form.value.file = event.files[0]; // 선택된 첫 번째 파일을 저장
};

// [함수] 서버로 데이터 전송 (등록 버튼 클릭 시)
const submitForm = async () => {
    try {
        // 1. Pinia 스토어에서 로그인된 유저 ID 확인
        const userId = authStore.userId;

        if (!userId) {
            // 로그인 정보가 없는 경우 처리
            alert('로그인 정보가 없습니다. 다시 로그인 해주세요');
            return; // 함수 종료
        }

        // 2. 서버로 보낼 최종 데이터 조립
        const sendData = {
            ...form.value, // 입력 폼의 모든 데이터 복사
            family_id: userId // Pinia의 userId를 family_id 컬럼에 매칭
        };

        // 3. 백엔드 API 호출 (경로 주의: /recipient/register 등... 서버 설정에 맞출 것)
        const response = await axios.post('/recipient/register', sendData);

        if (response.data.success) {
            // 서버 응답이 성공인 경우
            alert('대상자가 성공적으로 등록되었습니다.');
        }
    } catch (error) {
        // 통신 중 오류 발생 시
        console.error('Error:', error); // 콘솔에 상세 에러 출력
        alert('등록 중 오류 발생');
    }
};

// [감시자] 관계 설정이 '기타'가 아닐 경우 입력값 초기화
watch(
    () => form.value.relation, // 감시 대상: 관계 라디오 버튼
    (newVal) => {
        if (newVal !== '기타') {
            // '기타'가 선택 해제되면
            form.value.relationEtc = ''; // 직접 입력했던 내용 삭제
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
