<template>
    <div class="page-wrapper">
        <div class="content-container shadow-2">
            <div class="flex align-items-center justify-content-between mb-4">
                <h2 class="text-3xl font-bold m-0 text-900">지원대상자 추가</h2>
                <div class="flex gap-2">
                    <Button label="취소" class="p-button-text p-button-plain" @click="goBack" />
                    <Button type="submit" label="등록" class="px-5" @click="submitForm" />
                </div>
            </div>
            <hr class="mb-5 border-top-1 border-gray-200" />

            <form @submit.prevent="submitForm">
                <div class="field grid align-items-center">
                    <label for="name" class="col-12 md:col-2 font-semibold text-900">대상자 성명</label>
                    <div class="col-12 md:col-10">
                        <InputText id="name" v-model="form.name" placeholder="실명을 입력하세요" class="w-full md:w-25rem" />
                    </div>
                </div>

                <div class="field grid align-items-center">
                    <label for="birth" class="col-12 md:col-2 font-semibold text-900">생 년 월 일</label>
                    <div class="col-12 md:col-10">
                        <InputText id="birth" v-model="form.birthDate" placeholder="예)19900101" class="w-full md:w-25rem" />
                    </div>
                </div>

                <div class="field grid align-items-center">
                    <label class="col-12 md:col-2 font-semibold text-900">성 별</label>
                    <div class="col-12 md:col-10 flex gap-4">
                        <div class="flex align-items-center">
                            <RadioButton v-model="form.gender" inputId="female" value="female" name="gender" />
                            <label for="female" class="ml-2 cursor-pointer">여성</label>
                        </div>
                        <div class="flex align-items-center">
                            <RadioButton v-model="form.gender" inputId="male" value="male" name="gender" />
                            <label for="male" class="ml-2 cursor-pointer">남성</label>
                        </div>
                    </div>
                </div>

                <div class="field grid">
                    <label class="col-12 md:col-2 font-semibold text-900 mt-2">주 소</label>
                    <div class="col-12 md:col-10">
                        <div class="flex gap-2 mb-2">
                            <InputText v-model="form.zipcode" placeholder="우편번호" class="w-10rem" readonly />
                            <Button label="우편번호 검색" @click="openPostcode" class="p-button-outlined p-button-sm" />
                        </div>
                        <InputText v-model="form.address" placeholder="기본 주소" class="w-full mb-2" readonly />
                        <InputText v-model="form.detailAddress" placeholder="상세주소를 입력하세요" class="w-full" />
                    </div>
                </div>

                <div class="field grid align-items-center">
                    <label for="disabilityType" class="col-12 md:col-2 font-semibold text-900">장애유형</label>
                    <div class="col-12 md:col-10">
                        <Select id="disabilityType" v-model="form.disabilityType" :options="disabilityOptions" placeholder="선택하세요" class="w-full md:w-20rem" />
                    </div>
                </div>

                <div class="field grid">
                    <label class="col-12 md:col-2 font-semibold text-900 mt-1">대상자와의 관계</label>
                    <div class="col-12 md:col-10">
                        <div class="flex flex-wrap gap-x-4 gap-y-3 align-items-center">
                            <div v-for="rel in relations" :key="rel.value" class="flex align-items-center">
                                <RadioButton v-model="form.relation" :inputId="rel.value" :value="rel.value" name="relation" />
                                <label :for="rel.value" class="ml-2 cursor-pointer">{{ rel.label }}</label>
                            </div>
                            <div class="flex align-items-center gap-2">
                                <RadioButton v-model="form.relation" inputId="etc" value="etc" name="relation" />
                                <label for="etc" class="ml-2 cursor-pointer">기타</label>
                                <InputText v-model="form.relationEtc" :disabled="form.relation !== 'etc'" placeholder="직접 입력" class="p-inputtext-sm w-15rem" />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="field grid align-items-center">
                    <label class="col-12 md:col-2 font-semibold text-900">증빙 서류 첨부</label>
                    <div class="col-12 md:col-10">
                        <div class="flex align-items-center gap-3">
                            <FileUpload mode="basic" name="demo[]" auto chooseLabel="파일 첨부" @select="onFileSelect" class="p-button-sm" />
                            <span class="text-sm text-600" v-if="form.fileName">{{ form.fileName }}</span>
                            <span class="text-sm text-400" v-else>선택된 파일 없음</span>
                        </div>
                        <p class="text-xs text-red-500 mt-2 m-0">* 가입일 기준 3개월 이내 발급된 서류만 유효합니다.</p>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
// PrimeVue 컴포넌트 임포트
import InputText from 'primevue/inputtext';
import RadioButton from 'primevue/radiobutton';
import Button from 'primevue/button';
import Select from 'primevue/select';
import FileUpload from 'primevue/fileupload';

const router = useRouter();

const form = reactive({
    name: '',
    birthDate: '',
    gender: 'female', // 기본값 설정
    zipcode: '',
    address: '',
    detailAddress: '',
    disabilityType: null,
    relation: '부모', // 기본값 설정
    relationEtc: '',
    file: null,
    fileName: ''
});

const disabilityOptions = ['지체장애', '뇌병변장애', '시각장애', '청각장애', '언어장애', '지적장애', '자폐성장애'];

const relations = [
    { label: '부모', value: '부모' },
    { label: '배우자', value: '배우자' },
    { label: '자녀', value: '자녀' },
    { label: '친족', value: '친족' },
    { label: '후견인', value: '후견인' }
];

const openPostcode = () => {
    new window.daum.Postcode({
        oncomplete: (data) => {
            form.zipcode = data.zonecode;
            form.address = data.address;
            // 상세주소로 포커스 이동
            setTimeout(() => {
                document.getElementById('detailAddress')?.focus();
            }, 100);
        }
    }).open();
};

const onFileSelect = (event) => {
    const file = event.files[0];
    form.file = file;
    form.fileName = file.name;
};

const goBack = () => {
    router.back();
};

const submitForm = () => {
    // 간단한 유효성 검사 예시
    if (!form.name || !form.birthDate || !form.address) {
        alert('필수 정보를 모두 입력해주세요.');
        return;
    }

    // 기타 관계 처리
    const finalRelation = form.relation === 'etc' ? form.relationEtc : form.relation;
    if (form.relation === 'etc' && !form.relationEtc) {
        alert('기타 관계 내용을 입력해주세요.');
        return;
    }

    console.log('서버로 전송될 최종 데이터:', { ...form, relation: finalRelation });
    alert('등록 요청이 전송되었습니다.');
};
</script>

<style scoped>
.page-wrapper {
    padding: 2rem;
    background-color: #f8fafc; /* 연한 배경색 */
    min-height: 100vh;
}
.content-container {
    max-width: 1000px; /* 조금 더 넓게 설정 */
    margin: 0 auto;
    padding: 3rem; /* 여백 증가 */
    background-color: #ffffff;
    border-radius: 12px;
}
.field {
    margin-bottom: 2rem; /* 항목 간 간격 증가 */
    border-bottom: 1px solid #f1f5f9; /* 구분선 */
    padding-bottom: 1.5rem;
}
/* 마지막 항목은 구분선 제거 */
.field:last-of-type {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}
</style>
