<script setup>
import { ref } from 'vue'; // Vue의 반응형 데이터 처리를 위한 ref import
import { useRouter } from 'vue-router'; // 페이지 이동 처리를 위한 router import

const router = useRouter(); // 라우터 객체 생성

// 수정할 지원대상자의 기존 데이터 객체 (v-model 연결)
const targetForm = ref({
    name: '홍길동', // 대상자 성명 초기값
    birth: '1950-01-01', // 생년월일 초기값
    gender: '남성', // 성별 초기값
    postcode: '12345', // 우편번호 초기값
    address: '서울시 강남구 테헤란로 1', // 기본 주소 초기값
    detailAddress: '101호', // 상세 주소 초기값
    phone: '010-9999-8888', // 연락처 초기값
    relation: '부모' // 관계 초기값
});

// 수정 완료 버튼 클릭 시 실행될 함수
const updateTarget = () => {
    console.log('수정된 데이터:', targetForm.value); // 수정된 데이터를 콘솔에 기록
    alert('대상자 정보가 수정되었습니다.'); // 수정 완료 알림창 표시
    router.push({ name: 'targetList' }); // 수정 후 대상자 목록 페이지로 이동
};
</script>

<template>
    <div class="content-wrapper">
        <div class="form-container surface-card shadow-2">
            <h2 class="form-title">지원대상자 수정</h2>

            <div class="flex gap-2 mb-3">
                <div class="input-set flex-1 mb-0"><label>대상자 성명</label> <input type="text" v-model="targetForm.name" class="p-inputtext p-inputtext-sm" /></div>
                <div class="input-set flex-1 mb-0"><label>생년월일</label> <input type="text" v-model="targetForm.birth" class="p-inputtext p-inputtext-sm" placeholder="YYYY-MM-DD" /></div>
            </div>

            <div class="flex gap-2 mb-3">
                <div class="input-set flex-1 mb-0">
                    <label>성별</label>
                    <select v-model="targetForm.gender" class="p-inputtext p-inputtext-sm">
                        <option value="남성">남성</option>
                        <option value="여성">여성</option>
                    </select>
                </div>
                <div class="input-set flex-1 mb-0"><label>관계</label> <input type="text" v-model="targetForm.relation" class="p-inputtext p-inputtext-sm" /></div>
            </div>

            <div class="input-set">
                <label>주소</label>
                <div class="flex gap-2 mb-2"><input type="text" v-model="targetForm.postcode" class="p-inputtext p-inputtext-sm w-6rem" readonly /> <button class="post-btn">우편번호 검색</button></div>
                <input type="text" v-model="targetForm.address" class="p-inputtext p-inputtext-sm mb-2" readonly /> <input type="text" v-model="targetForm.detailAddress" class="p-inputtext p-inputtext-sm" placeholder="상세주소를 입력하세요" />
            </div>

            <div class="input-set mb-4"><label>연락처</label> <input type="text" v-model="targetForm.phone" class="p-inputtext p-inputtext-sm" placeholder="010-0000-0000" /></div>

            <div class="btn-group gap-2">
                <button class="p-button p-button-outlined p-button-secondary w-full p-button-sm border-round" @click="router.back()">취소</button>
                <button class="submit-btn text-white border-round" @click="updateTarget">수정 완료</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 화면 중앙 정렬 및 상하 여백 설정 */
.content-wrapper {
    display: flex; /* 자식 요소를 유연하게 배치 */
    justify-content: center; /* 가로 중앙 정렬 */
    width: 100%; /* 부모 너비 전체 사용 */
    padding: 20px 0; /* 위아래 여백 20px */
}

/* 폼을 감싸는 카드 컨테이너 스타일 (너비 500px 고정) */
.form-container {
    width: 100%; /* 기본 너비 */
    max-width: 500px; /* 최대 500px까지만 확장 */
    padding: 2rem !important; /* 내부 여백 넉넉히 설정 */
    border-radius: 12px; /* 모서리 둥글게 */
}

/* 제목 스타일 (중앙 정렬 및 색상 설정) */
.form-title {
    font-size: 1.4rem; /* 제목 글자 크기 */
    font-weight: bold; /* 두껍게 */
    text-align: center; /* 가운데 정렬 */
    margin-bottom: 1.8rem; /* 아래 간격 */
    color: #334155; /* 짙은 회색 */
}

/* 라벨과 입력창 세로 배치 세트 */
.input-set {
    display: flex; /* 유연한 배치 */
    flex-direction: column; /* 위에서 아래로 정렬 */
    margin-bottom: 0.9rem; /* 세트 간 간격 */
}

/* 입력창 위 라벨 스타일 */
.input-set label {
    font-weight: 600; /* 약간 두껍게 */
    margin-bottom: 0.4rem; /* 입력창과의 간격 */
    font-size: 0.9rem; /* 크기 살짝 축소 */
    color: #475569; /* 부드러운 회색 */
}

/* 녹색 테두리의 우편번호 검색 버튼 */
.post-btn {
    background: white; /* 배경 흰색 */
    border: 1px solid #10b981; /* 녹색 선 */
    color: #10b981; /* 녹색 글자 */
    padding: 0 1rem; /* 좌우 여백 */
    border-radius: 6px; /* 모서리 둥글게 */
    font-size: 0.85rem; /* 크기 축소 */
    cursor: pointer; /* 손가락 모양 커서 */
    transition: 0.2s; /* 부드러운 전환 효과 */
}

/* 검색 버튼 마우스 오버 효과 */
.post-btn:hover {
    background: #f0fdf4; /* 연한 녹색 배경 */
}

/* 하단 버튼들을 묶어주는 그룹 */
.btn-group {
    display: flex; /* 가로 배치 */
    justify-content: center; /* 중앙 정렬 */
}

/* 하단 메인 수정 버튼 (녹색 배경) */
.submit-btn {
    width: 100%; /* 가로 꽉 채우기 */
    padding: 0.7rem; /* 상하 패딩 */
    font-size: 1rem; /* 기본 크기 */
    font-weight: bold; /* 두껍게 */
    background-color: #10b981; /* 배경 녹색 */
    border: none; /* 테두리 제거 */
    cursor: pointer; /* 손가락 모양 커서 */
}

/* PrimeVue 입력창 높이 슬림화 */
:deep(.p-inputtext-sm) {
    padding: 0.5rem 0.75rem; /* 좁은 패딩 적용 */
}

/* 비활성화 상태 입력창 색상 정의 */
:deep(.p-inputtext:disabled) {
    background-color: #f1f5f9; /* 연한 회색 배경 */
    border-color: #e2e8f0; /* 연한 회색 테두리 */
}
</style>
