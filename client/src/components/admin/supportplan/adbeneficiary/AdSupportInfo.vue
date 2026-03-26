<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useSurveyStore } from '@/stores/useSurveyStore'; // 💡 스토어 가져오기

const authStore = useAuthStore();
const surveyStore = useSurveyStore(); // 💡 스토어 초기화
const emit = defineEmits(['updateBeneId', 'open-priority']); // 💡 팝업 이벤트를 위해 open-priority 추가

const selectedBeneId = ref('');
const AdSupportList = ref([]);
const selectedBene = ref({});

const fetchBeneDetail = async () => {
    if (!selectedBeneId.value) {
        selectedBene.value = {};
        return;
    }
    const response = await axios.get(`http://localhost:3000/api/beneficiaries/${selectedBeneId.value}`);
    selectedBene.value = response.data;
    emit('updateBeneId', selectedBeneId.value, response.data.priority_id);
};

onMounted(async () => {
    const agencylist = authStore.agencyId;
    const response = await axios.get('http://localhost:3000/adsupport/AdSupportList', {
        params: { agency_id: agencylist }
    });
    AdSupportList.value = response.data;
});
</script>

<template>
    <h3>지원자 정보</h3>

    <div class="BfInfo">
        <table>
            <tbody>
                <tr>
                    <th><label>지원자</label></th>
                    <td>
                        <select v-model="selectedBeneId" @change="fetchBeneDetail">
                            <option value="">지원자를 선택하세요</option>
                            <template v-if="authStore.userId">
                                <option v-for="bene in AdSupportList" :key="bene.bene_id" :value="bene.bene_id">
                                    {{ bene.bene_name }}
                                </option>
                            </template>
                        </select>
                    </td>
                    <th><label>보호자</label></th>
                    <td>
                        <input type="text" :value="selectedBene.family_name || ''" readonly />
                    </td>

                    <th><label>대기단계</label></th>
                    <td>
                        <!-- 💡 핵심 수정: 영문 로컬 데이터 버리고, Pinia의 한글 번역 Getter를 연결하여 실시간 동기화 -->
                        <input type="text" :value="surveyStore.priorityStatusKor" readonly class="clickable-input" @click="emit('open-priority')" />
                    </td>
                </tr>
                <tr>
                    <th><label>성별</label></th>
                    <td>
                        <input type="text" :value="selectedBene.gender ? (selectedBene?.gender == 'M' ? '남자' : '여자') : ''" readonly />
                    </td>
                    <th><label>생년월일</label></th>
                    <td>
                        <input type="text" :value="selectedBene.birth_date || ''" readonly />
                    </td>
                    <th><label>장애유형</label></th>
                    <td>
                        <input type="text" :value="selectedBene.disability_type || ''" readonly />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
/* 카드 전체 컨테이너 */
.BfInfo {
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px 15px; /* 좌우 패딩을 줄여 내부 공간 확보 */
    width: 100%;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 15px;
    margin-top: 0;
}

/* 테이블 레이아웃 */
table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed; /* 3등분 유지 */
}

/* 🟢 라벨(th) 영역: 너비를 더 줄여서 인풋 공간 확보 */
th {
    width: 60px; /* 기존 75~80px에서 60px로 축소 */
    padding: 10px 0;
    text-align: left;
    vertical-align: middle;
}

th label {
    font-size: 0.85rem;
    color: #64748b;
    font-weight: 600;
    white-space: nowrap; /* 한 줄 고정 */
}

/* 🔵 데이터(td) 영역: 인풋 길이를 최대한 확보 */
td {
    padding: 8px 12px 8px 2px; /* 라벨과의 거리를 2px로 좁힘 */
    vertical-align: middle;
}

/* 입력창 및 셀렉트 박스 */
select,
input[type='text'] {
    width: 100%; /* td의 남은 공간을 꽉 채움 */
    height: 38px;
    padding: 0 10px;
    border: 1px solid #cbd5e1;
    border-radius: 8px; /* 조금 더 둥근 느낌으로 세련되게 */
    font-size: 0.9rem;
    color: #334155;
    background-color: #ffffff;
    outline: none;
    transition: border-color 0.2s;
}

/* 읽기 전용 박스 디자인 */
input[readonly] {
    background-color: #f8fafc;
    border-color: #e2e8f0;
    color: #475569;
}

/* 마지막 열 우측 패딩 제거 */
td:last-child {
    padding-right: 0;
}

/* 셀렉트 박스 포커스 시 디자인 */
select:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}
.clickable-input {
    cursor: pointer;
    transition: all 0.2s;
}

.clickable-input:hover {
    border-color: #3b82f6 !important;
    background-color: #f0f8ff !important;
    box-shadow: inset 0 0 0 1px #3b82f6;
}
</style>
