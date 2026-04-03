<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import axios from 'axios';

const authStore = useAuthStore();
const { userId } = storeToRefs(authStore);

// 1. 상태 관리
const isEditMode = ref(false); // 수정 모드 여부

// 2. 기관 데이터 (기획서 image_f6dcfe.png 기반 더미데이터)
const centerData = reactive({
    agency_id: '',
    agency_name: '',
    zip_code: '',
    address: '',
    detail_address: '', // addressDetail에서 DB 컬럼명과 같은 detail_address로 변경했습니다.
    rep_tel: '',
    email: '',
    biz_reg_no: ''
});

// 카카오 주소 API 스크립트를 페이지에 동적으로 로드하는 함수
const loadDaumPostcodeScript = () => {
    if (window.daum && window.daum.Postcode) return; // 이미 로드되어 있다면 중복 로드 방지
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    document.head.appendChild(script);
};

const searchAddress = () => {
    new window.daum.Postcode({
        oncomplete: (data) => {
            // 도로명 주소와 지번 주소 중 사용자가 선택한 타입을 우선 적용
            const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
            const extraAddr = data.bname !== '' ? ` (${data.bname})` : ''; // 법정동명 등 추가 주소 구성

            centerData.zip_code = data.zonecode; // 우편번호(5자리) 저장
            centerData.address = addr + extraAddr; // 기본 주소와 추가 주소 합쳐서 저장

            setTimeout(() => {
                document.getElementById('detailAddrInput')?.focus(); // 주소 입력 후 상세주소 칸으로 자동 포커스
            }, 100);
        }
    }).open();
};

// 데이터 로드
const fetchCenterInfo = async () => {
    if (!userId.value) return;
    try {
        const response = await axios.get(`/api/adagencyinfo/center-info/${userId.value}`);
        if (response.data) {
            // 서버 응답 데이터를 centerData에 매핑
            Object.assign(centerData, response.data);
        }
    } catch (err) {
        console.error('데이터 로드 실패:', err);
    }
};

onMounted(() => {
    fetchCenterInfo();
    loadDaumPostcodeScript();
});

// 3. 수정 모드 전환
const toggleEditMode = () => {
    isEditMode.value = true;
};

// 4. 저장 로직 (확인 버튼 클릭 시)
const handleSave = async () => {
    if (confirm('기관 정보를 수정하시겠습니까?')) {
        try {
            // 서버의 updateAgencyInfo 쿼리에 필요한 데이터 전달
            const response = await axios.put('/api/adagencyinfo/center-info', {
                agency_id: centerData.agency_id,
                agency_name: centerData.agency_name,
                rep_tel: centerData.rep_tel,
                email: centerData.email,
                address: centerData.address,
                zip_code: centerData.zip_code,
                detail_address: centerData.detail_address // 서버 업데이트 시 상세주소 데이터도 함께 전송합니다.
            });

            if (response.data.success) {
                alert('성공적으로 저장되었습니다');
                isEditMode.value = false;
                await fetchCenterInfo(); // 최신 데이터 다시 불러오기
            }
        } catch (err) {
            console.error('저장 실패:', err);
            alert('저장 중 오류 발생');
        }
    }
};
</script>

<template>
    <div class="center-info-wrapper">
        <div class="card">
            <div class="section-header">
                <h3 class="text-xl font-bold">기관 정보</h3>
                <div class="button-group">
                    <button v-if="!isEditMode" @click="toggleEditMode" class="p-button p-button-sm coral-btn">수정하기</button>
                    <button v-else @click="handleSave" class="p-button p-button-sm coral-btn">저장하기</button>
                </div>
            </div>

            <div class="info-grid">
                <div class="info-row">
                    <label>기관명</label>
                    <div class="input-container">
                        <input v-model="centerData.agency_name" type="text" class="p-inputtext" :disabled="!isEditMode" />
                    </div>
                </div>

                <div class="info-row">
                    <label>주소</label>
                    <div class="input-container address-group">
                        <div class="zipcode-row">
                            <input v-model="centerData.zip_code" type="text" class="p-inputtext zip-input" disabled />
                            <button type="button" @click="searchAddress" class="p-button p-button-sm" :class="isEditMode ? 'p-button-success' : 'p-button-secondary'" :disabled="!isEditMode">우편번호 검색</button>
                        </div>

                        <input v-model="centerData.address" type="text" class="p-inputtext w-full mt-2" disabled />

                        <input id="detailAddrInput" v-model="centerData.detail_address" type="text" class="p-inputtext w-full mt-2" :disabled="!isEditMode" placeholder="상세주소를 입력하세요" />
                    </div>
                </div>

                <div class="info-row">
                    <label>대표번호</label>
                    <div class="input-container">
                        <input v-model="centerData.rep_tel" type="text" class="p-inputtext" :disabled="!isEditMode" />
                    </div>
                </div>

                <div class="info-row">
                    <label>이메일</label>
                    <div class="input-container">
                        <input v-model="centerData.email" type="text" class="p-inputtext" :disabled="!isEditMode" />
                    </div>
                </div>

                <div class="info-row no-border">
                    <label>사업자번호</label>
                    <div class="input-container">
                        <input v-model="centerData.biz_reg_no" type="text" class="p-inputtext opacity-70" disabled />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 페이지 전체 컨테이너 */
.center-info-wrapper {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

/* 카드 레이아웃 (AdminInfo와 통일) */
.card {
    background: white !important;
    border-radius: 16px !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05) !important;
    padding: 2.5rem !important;
    border: 2px solid #f4e2de !important;
}

/* 헤더 영역 */
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1.25rem;
    border-bottom: 2px solid #f4e2de;
    margin-bottom: 2rem;
}

/* 정보 그리드 레이아웃 */
.info-grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

/* 각 행의 레이아웃 (라벨 200px 고정) */
.info-row {
    display: flex;
    align-items: flex-start;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #f4e2de;
}

.info-row.no-border {
    border-bottom: none;
    padding-bottom: 0;
}

.info-row label {
    width: 200px;
    font-weight: 600;
    color: #475569;
    padding-top: 0.75rem;
}

.input-container {
    flex: 1;
}

/* 입력 필드 기본 스타일 */
.p-inputtext {
    width: 100%;
    padding: 0.85rem;
    border-radius: 8px;
    background-color: #f8fafc !important;
    border: 2px solid #f4e2de;
    font-size: 0.95rem;
    transition: all 0.2s ease;
}

/* 수정 불가능한 필드 스타일 (회색 처리) */
.p-inputtext:disabled {
    background-color: #f1f5f9 !important;
    color: #94a3b8;
    cursor: not-allowed;
    border-color: #e2e8f0;
}

/* 수정 가능한 필드가 활성화되었을 때 강조 (isEditMode) */
.p-inputtext:not(:disabled) {
    background-color: #ffffff !important;
    border-color: #10b981;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
}

/* 주소 영역 특화 스타일 */
.zipcode-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.zip-input {
    width: 120px !important;
}

/* 버튼 그룹 */
.button-group {
    display: flex;
    gap: 0.5rem;
}

/* 모든 버튼에 공통으로 적용될 강제 스타일 */
.p-button.coral-btn {
    background-color: #ffab91 !important; /* 배경색 코랄 */
    color: #ffffff !important; /* 글자색 흰색 */
    border: 1px solid #ffab91 !important; /* 테두리색 코랄 */
    font-weight: 700 !important; /* 글자 두껍게 */
    border-radius: 6px !important; /* 모서리 곡률 */
    opacity: 1 !important; /* 투명도 제거 */
    box-shadow: none !important; /* 기본 그림자 제거 */
    padding: 5px;
}

/* 마우스를 올렸을 때 스타일 */
.p-button.coral-btn:enabled:hover {
    background-color: #ff9e80 !important; /* 살짝 진한 코랄 */
    border-color: #ff9e80 !important;
    color: #ffffff !important;
}

/* 버튼 내부 아이콘이 있다면 흰색으로 고정 */
.p-button.coral-btn .pi {
    color: #ffffff !important;
}

/* 반응형 모바일 대응 */
@media (max-width: 768px) {
    .info-row {
        flex-direction: column;
    }

    .info-row label {
        width: 100%;
        margin-bottom: 0.5rem;
    }
}
</style>
