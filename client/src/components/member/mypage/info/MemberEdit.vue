<script setup>
import { ref } from 'vue'; // 반응형 데이터 처리를 위한 ref
import { useRouter } from 'vue-router'; // 페이지 이동을 위한 router

const router = useRouter(); // 라우터 인스턴스 생성

// 사용자 정보 데이터 객체 (소속 기관 필드 추가)
const memberForm = ref({
    name: '김태윤',
    id: 'hong1',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    // 소속 기관 관련 데이터
    agencyRegion: '대구', // 소속 지역
    agencyName: 'ㅁㅁ 복지센터', // 소속 센터명
    postcode: '13636',
    address: '경기 성남시 분당구 판교역 4',
    detailAddress: '104동 111호',
    phone: '010-1111-2222',
    email: 'hong1@naver.com'
});

// 정보 저장 로직
const saveInfo = () => {
    // 비밀번호 확인 로직 (기획서 2번 내용 준수)
    if (memberForm.value.newPassword !== memberForm.value.confirmPassword) {
        alert('새 비밀번호와 확인 값이 일치하지 않습니다.');
        return;
    }
    console.log('저장될 데이터:', memberForm.value);
    alert('정보가 저장되었습니다.');
    router.push({ name: 'myInfo' });
};
</script>

<template>
    <div class="content-wrapper">
        <div class="form-container surface-card shadow-2">
            <h2 class="form-title">내 정보 수정</h2>

            <div class="flex gap-2 mb-3">
                <div class="input-set flex-1 mb-0">
                    <label>이름</label>
                    <input type="text" v-model="memberForm.name" class="p-inputtext p-inputtext-sm" />
                </div>
                <div class="input-set flex-1 mb-0">
                    <label>아이디</label>
                    <input type="text" v-model="memberForm.id" class="p-inputtext p-inputtext-sm" disabled />
                </div>
            </div>

            <div class="surface-50 p-3 border-round mb-3 border-1 surface-border">
                <h3 class="text-sm font-bold mb-3 text-teal-700">비밀번호 변경</h3>
                <div class="input-set">
                    <label class="text-primary">현재 비밀번호</label>
                    <input type="password" v-model="memberForm.currentPassword" class="p-inputtext p-inputtext-sm" placeholder="기존 비밀번호를 입력하세요" />
                </div>
                <div class="flex gap-2">
                    <div class="input-set flex-1 mb-0">
                        <label>새 비밀번호</label>
                        <input type="password" v-model="memberForm.newPassword" class="p-inputtext p-inputtext-sm" placeholder="새 비밀번호 입력" />
                    </div>
                    <div class="input-set flex-1 mb-0">
                        <label>새 비밀번호 확인</label>
                        <input type="password" v-model="memberForm.confirmPassword" class="p-inputtext p-inputtext-sm" placeholder="새 비밀번호 재입력" />
                    </div>
                </div>
            </div>

            <div class="input-set">
                <label>소속 기관 선택</label>
                <div class="flex gap-2">
                    <input type="text" v-model="memberForm.agencyRegion" class="p-inputtext p-inputtext-sm flex-1" placeholder="지역(예: 대구)" />
                    <input type="text" v-model="memberForm.agencyName" class="p-inputtext p-inputtext-sm flex-2" placeholder="센터명(예: ㅁㅁ 복지센터)" />
                </div>
            </div>

            <div class="input-set">
                <label>주소</label>
                <div class="flex gap-2 mb-2">
                    <input type="text" v-model="memberForm.postcode" class="p-inputtext p-inputtext-sm w-6rem" readonly />
                    <button class="post-btn">우편번호 검색</button>
                </div>
                <input type="text" v-model="memberForm.address" class="p-inputtext p-inputtext-sm mb-2" readonly />
                <input type="text" v-model="memberForm.detailAddress" class="p-inputtext p-inputtext-sm" placeholder="상세주소를 입력하세요" />
            </div>

            <div class="flex gap-2 mb-4">
                <div class="input-set flex-1 mb-0">
                    <label>전화번호</label>
                    <input type="text" v-model="memberForm.phone" class="p-inputtext p-inputtext-sm" />
                </div>
                <div class="input-set flex-1 mb-0">
                    <label>이메일 주소</label>
                    <input type="email" v-model="memberForm.email" class="p-inputtext p-inputtext-sm" />
                </div>
            </div>

            <div class="btn-group gap-2">
                <button class="p-button p-button-outlined p-button-secondary w-full p-button-sm justify-content-center border-round" @click="router.back()">취소</button>
                <button class="submit-btn text-white border-round" @click="saveInfo">정보 저장</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 이전과 동일한 스타일 유지 */
.content-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 20px 0;
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
    cursor: pointer;
}
:deep(.p-inputtext-sm) {
    padding: 0.5rem 0.75rem;
}
:deep(.p-inputtext:disabled) {
    background-color: #f1f5f9;
    border-color: #e2e8f0;
    opacity: 0.8;
}

/* 소속 기관의 비율 조절을 위한 클래스 */
.flex-1 {
    flex: 1;
}
.flex-2 {
    flex: 2;
}
</style>
