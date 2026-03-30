<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const recipientId = route.params.id; // 수정할 대상자의 ID

const disabilityOptions = ['지체장애', '시각장애', '청각장애', '지적장애', '뇌병변장애', '기타'];
const relations = ['부모', '배우자', '자녀', '친족', '후견인', '기타'];

const form = ref({
    name: '',
    birth: '',
    gender: '여성',
    postcode: '', // 일반 이용자의 DB 주소로 채워질 예정
    address: '', // 일반 이용자의 DB 주소로 채워질 예정
    detailAddress: '', // 일반 이용자의 DB 주소로 채워질 예정
    disabilityType: null,
    relation: '부모',
    relationEtc: ''
});

watch(
    () => form.value.relation,
    (newVal) => {
        if (newVal !== '기타') form.value.relationEtc = '';
    }
);

onMounted(async () => {
    try {
        // 1. 수정할 대상자의 기본 정보 가져오기
        const resTarget = await axios.get(`/api/recipient/${recipientId}`);
        if (resTarget.data) {
            const d = resTarget.data;
            // DB 컬럼명에 맞춰서 매칭
            form.value.name = d.bene_name || d.BENE_NAME;

            // 날짜에 포함된 '-' 제거
            const rawBirth = d.birth_date || d.BIRTH_DATE;
            form.value.birth = rawBirth ? rawBirth.split('T')[0].replace(/-/g, '') : '';

            const genderVal = d.gender || d.GENDER;
            form.value.gender = genderVal === 'M' ? '남성' : '여성';
            form.value.disabilityType = d.disability_type || d.DISABILITY_TYPE;

            // [관계 로직 수정]
            const relationOptions = ['부모', '배우자', '자녀', '친족', '후견인'];
            if (relationOptions.includes(d.relationship)) {
                form.value.relation = d.relationship;
                form.value.relationEtc = '';
            } else {
                form.value.relation = '기타';
                form.value.relationEtc = d.relationship;
            }
        }

        // 2. [핵심] 일반 이용자(본인)의 주소 정보를 가져와서 덮어쓰기
        // MemberEdit.vue에서 사용했던 본인 정보 조회 API를 활용하세요.
        if (authStore.userId) {
            const resUser = await axios.get(`/api/info/user-detail/${authStore.userId}`);
            if (resUser.data) {
                // MemberEdit.vue의 데이터 구조에 맞춰 할당
                form.value.postcode = resUser.data.zip_code;
                form.value.address = resUser.data.address;
                form.value.detailAddress = resUser.data.detail_address;
            }
        }
    } catch (error) {
        console.error('데이터 로드 실패:', error);
    }
});

const updateRecipient = async () => {
    try {
        // [1번 적용] 서버가 인식할 수 있도록 '남성/여성' 문자열을 'M/F' 코드로 변환하여 전송
        const payload = { ...form.value, gender: form.value.gender === '남성' ? 'M' : 'F' };

        const response = await axios.put(`/api/recipient/${recipientId}`, payload);
        if (response.data.success) {
            alert('수정 완료!');
            router.push('/mypage/info');
        }
    } catch (error) {
        alert('수정 중 오류가 발생했습니다.');
    }
};
// 주소 검색 API 연동 (기존 로직 사용)
const openPostcode = () => {
    new window.daum.Postcode({
        oncomplete: (data) => {
            form.value.postcode = data.zonecode;
            form.value.address = data.address;
        }
    }).open();
};
</script>

<template>
    <div class="content-wrapper">
        <div class="form-container surface-card shadow-2">
            <h5 class="form-title">지원대상자 정보 수정</h5>

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
                        <div class="flex align-items-center">
                            <RadioButton v-model="form.gender" inputId="f" value="여성" />
                            <label for="f" class="ml-2 text-sm">여성</label>
                        </div>
                        <div class="flex align-items-center">
                            <RadioButton v-model="form.gender" inputId="m" value="남성" />
                            <label for="m" class="ml-2 text-sm">남성</label>
                        </div>
                    </div>
                </div>

                <div class="input-set">
                    <label>주소 <span class="text-xs text-primary">(회원 정보와 동일)</span></label>
                    <InputText v-model="form.postcode" class="p-inputtext-sm w-8rem disabled-input mb-2" readonly />
                    <InputText v-model="form.address" class="p-inputtext-sm mb-2 disabled-input" readonly />
                    <InputText v-model="form.detailAddress" class="p-inputtext-sm disabled-input" readonly />
                    <small class="mt-1 text-gray-500">* 주소 변경은 마이페이지 > 내 정보 관리 > 내 정보 수정에서 가능합니다.</small>
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
                        </div>
                        <InputText v-if="form.relation === '기타'" v-model="form.relationEtc" placeholder="직접 입력" class="p-inputtext-sm ml-2" style="width: 120px" />
                    </div>
                </div>

                <div class="btn-group gap-3 mt-4">
                    <Button label="취 소" class="p-button-secondary cancel-btn" @click="router.back()" />
                    <Button label="수정 완료" class="p-button-success submit-btn" @click="updateRecipient" />
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
    padding: 5px 0 40px 0; /* MemberEdit와 동일하게 위로 바짝 올림 */
    background-color: #f8fafc;
}

.form-container {
    width: 100%;
    max-width: 550px; /* 너비 통일 */
    background-color: #ffffff;
    padding: 1.2rem 2rem !important; /* 상단 여백 축소 버전 */
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.form-title {
    font-size: 1.3rem;
    font-weight: bold;
    text-align: center;
    margin-bottom: 1.2rem;
    color: #334155;
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

/* 주소 등 읽기 전용 입력창 스타일 */
.disabled-input {
    background-color: #f1f5f9 !important;
    border-color: #e2e8f0 !important;
    color: #64748b !important;
    cursor: not-allowed !important;
}

.btn-group {
    display: flex;
    justify-content: center;
    margin-top: 1.5rem;
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

/* PrimeVue 컴포넌트 내부 여백 미세 조정 */
:deep(.p-inputtext-sm),
:deep(.p-select-sm) {
    padding: 0.4rem 0.7rem;
}

:deep(.p-radiobutton .p-radiobutton-box) {
    width: 18px;
    height: 18px;
}
</style>
