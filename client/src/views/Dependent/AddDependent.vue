<template>
    <div class="add-dependent-page">
        <header class="content-header">
            <h2 class="page-title">지원대상자 추가</h2>
        </header>

        <form @submit.prevent="submitForm">
            <div class="form-card">
                <div class="form-grid">
                    <div class="form-row">
                        <label class="field-label">대상자 성명</label>
                        <div class="field-input">
                            <input type="text" v-model="formData.name" placeholder="성명을 입력하세요" class="base-input" required />
                        </div>
                    </div>

                    <div class="form-row">
                        <label class="field-label">생 년 월 일</label>
                        <div class="field-input">
                            <input type="text" v-model="formData.birthDate" placeholder="19990101" class="base-input" maxlength="8" required />
                        </div>
                    </div>

                    <div class="form-row">
                        <label class="field-label">성 별</label>
                        <div class="field-input radio-group">
                            <label class="radio-item"><input type="radio" value="female" v-model="formData.gender" /> <span>여성</span></label>
                            <label class="radio-item"><input type="radio" value="male" v-model="formData.gender" /> <span>남성</span></label>
                        </div>
                    </div>

                    <div class="form-row address-section">
                        <label class="field-label">주 소</label>
                        <div class="field-input">
                            <div class="address-search-group">
                                <input type="text" v-model="formData.zipCode" class="base-input zip-input" readonly placeholder="우편번호" />
                                <button type="button" class="btn-search-zip" @click="openPostcode">우편번호 검색</button>
                            </div>
                            <input type="text" v-model="formData.addressMain" class="base-input mt-2" readonly placeholder="기본 주소" />
                            <input type="text" v-model="formData.addressDetail" class="base-input mt-2" placeholder="상세 주소를 입력하세요" required />
                        </div>
                    </div>

                    <div class="form-row">
                        <label class="field-label">장애유형</label>
                        <div class="field-input">
                            <select v-model="formData.disabilityType" class="base-select" required>
                                <option value="">선택하세요</option>
                                <option value="physical">지체장애</option>
                                <option value="visual">시각장애</option>
                                <option value="hearing">청각장애</option>
                                <option value="intellectual">지적장애</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <label class="field-label">대상자와 관계</label>
                        <div class="field-input relation-group">
                            <label v-for="rel in ['부모', '배우자', '자녀', '친척']" :key="rel" class="radio-item">
                                <input type="radio" :value="rel" v-model="formData.relation" /> <span>{{ rel }}</span>
                            </label>
                            <label class="radio-item etc-container">
                                <input type="radio" value="기타" v-model="formData.relation" />
                                <span>기타</span>
                                <input type="text" v-model="formData.relationEtc" class="etc-input" :disabled="formData.relation !== '기타'" :class="{ 'active-input': formData.relation === '기타' }" placeholder="직접 입력" />
                            </label>
                        </div>
                    </div>

                    <div class="form-row no-border">
                        <label class="field-label">증빙 서류 첨부</label>
                        <div class="field-input">
                            <input type="file" ref="fileRef" style="display: none" @change="onFileChange" />
                            <button type="button" class="btn-outline" @click="fileRef.click()">파일 선택</button>
                            <span class="file-name">{{ fileName || '선택된 파일 없음' }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn-primary">등 록</button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const formData = reactive({
    name: '',
    birthDate: '',
    gender: 'female',
    zipCode: '',
    addressMain: '',
    addressDetail: '',
    disabilityType: '',
    relation: '',
    relationEtc: ''
});

const fileRef = ref(null);
const fileName = ref('');

// 카카오 우편번호 스크립트 로드
onMounted(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);
});

// 우편번호 팝업 열기
const openPostcode = () => {
    new window.daum.Postcode({
        oncomplete: (data) => {
            formData.zipCode = data.zonecode;
            formData.addressMain = data.roadAddress || data.jibunAddress;
            formData.addressDetail = ''; // 상세주소 초기화
        }
    }).open();
};

const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) fileName.value = file.name;
};

const submitForm = async () => {
    try {
        // 2. 백엔드에서 기대하는 '기타' 관계값 처리
        const finalRelation = formData.relation === '기타' ? formData.relationEtc : formData.relation;

        // 서버로 보낼 최종 데이터 객체 생성
        const payload = {
            ...formData,
            relation: finalRelation
        };

        // 3. 실제 서버 API로 데이터 전송 (POST 요청)
        const response = await axios.post('/api/dependent/add', payload);

        if (response.data.success) {
            alert('지원대상자가 성공적으로 등록되었습니다.');
            // 4. 등록 후 목록 페이지나 메인으로 이동 (원하는 경로로 수정 가능)
            // router.push('/Dependent/list');
        } else {
            alert('등록 실패: ' + response.data.message);
        }
    } catch (error) {
        console.error('등록 중 에러 발생:', error);
        alert('서버와 통신 중 오류가 발생했습니다.');
    }
};
</script>

<style scoped>
.page-title {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 24px;
    color: #333;
}
.form-card {
    border-top: 2px solid #333;
    background: #fff;
    padding: 10px 0;
}
.form-row {
    display: flex;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid #f0f0f0;
}
.no-border {
    border-bottom: none;
}
.field-label {
    width: 160px;
    font-weight: 600;
    color: #444;
}
.field-input {
    flex: 1;
}

.base-input,
.base-select {
    width: 100%;
    max-width: 400px;
    height: 44px;
    border: 1px solid #ddd;
    padding: 0 12px;
    border-radius: 4px;
}

/* 우편번호 버튼 디자인 강조 */
.address-search-group {
    display: flex;
    gap: 10px;
    align-items: center;
}
.zip-input {
    max-width: 150px;
    background-color: #f9f9f9;
}
.btn-search-zip {
    height: 44px;
    padding: 0 20px;
    background-color: #4a5568;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
}
.btn-search-zip:hover {
    background-color: #2d3748;
}

/* 기타 입력창 스타일 */
.relation-group {
    display: flex;
    gap: 20px;
    align-items: center;
}
.etc-container {
    display: flex;
    align-items: center;
    gap: 10px;
}
.etc-input {
    width: 180px;
    height: 36px;
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 0 10px;
    background-color: #f5f5f5;
}
/* 활성화 되었을 때 테두리 강조 */
.active-input {
    border: 1px solid #333;
    background-color: #fff;
}

.radio-group,
.radio-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
}
.mt-2 {
    margin-top: 8px;
}
.btn-primary {
    width: 220px;
    height: 56px;
    background: #333;
    color: #fff;
    border: none;
    font-weight: 700;
    cursor: pointer;
}
.form-actions {
    display: flex;
    justify-content: center;
    margin-top: 40px;
}
.btn-outline {
    padding: 8px 16px;
    border: 1px solid #ddd;
    background: #fff;
    cursor: pointer;
    border-radius: 4px;
}
.file-name {
    margin-left: 10px;
    color: #888;
    font-size: 14px;
}
</style>
