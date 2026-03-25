<script setup>
// 1. Vue 내장 함수
import { ref, onMounted, computed } from 'vue';
// 2. 외부 라이브러리 (Pinia)
import { storeToRefs } from 'pinia';
// 3. 로컬 스토어 및 기타
import { useSurveyStore } from '@/stores/useSurveyStore';

const surveyStore = useSurveyStore();
// 스토어 상태를 반응형으로 추출
const { my_beneficiaries, selected_bene_detail } = storeToRefs(surveyStore);

// 지원자 선택 select 박스에 바인딩할 로컬 ID
const localSelectedId = ref('');

// 스토어에서 받아온 성별 코드(M/F)를 한글로 변환
const formattedGender = computed(() => {
    const gender = selected_bene_detail.value?.gender;
    if (gender === 'M') return '남자';
    if (gender === 'F') return '여자';
    return '';
});

// 지원자 select 박스 변경 시 실행되는 함수
const handleSelectChange = async () => {
    // 스토어 액션을 호출하여 전역 상태(ID, 상세정보, 관련 신청 리스트 등) 업데이트
    await surveyStore.selectBeneficiary(localSelectedId.value);
};

// 컴포넌트 마운트 시 지원자 리스트가 없다면 최초 1회 로드
onMounted(async () => {
    if (surveyStore.my_beneficiaries.length === 0) {
        await surveyStore.fetchBeneficiaryList();
    }
});
</script>

<template>
    <!-- 다중 루트 노드 에러(Fragment warning) 방지를 위한 래퍼 div -->
    <div class="beneficiary-info-container">
        <h3>지원자 정보</h3>
        <div class="BfInfo">
            <table>
                <tbody>
                    <tr>
                        <th><label>지원자</label></th>
                        <td>
                            <select v-model="localSelectedId" @change="handleSelectChange">
                                <option value="">지원자를 선택하세요</option>
                                <option v-for="bene in my_beneficiaries" :key="bene.bene_id" :value="bene.bene_id">
                                    {{ bene.bene_name }}
                                </option>
                            </select>
                        </td>

                        <th><label>보호자</label></th>
                        <td><input type="text" :value="selected_bene_detail.family_name || ''" readonly /></td>

                        <th><label>대기단계</label></th>
                        <td><input type="text" :value="selected_bene_detail.priority_status || ''" readonly /></td>
                    </tr>
                    <tr>
                        <th><label>성별</label></th>
                        <td><input type="text" :value="formattedGender" readonly /></td>

                        <th><label>생년월일</label></th>
                        <td><input type="text" :value="selected_bene_detail.birth_date || ''" readonly /></td>

                        <th><label>장애유형</label></th>
                        <td><input type="text" :value="selected_bene_detail.disability_type || ''" readonly /></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.beneficiary-info-container {
    width: 100%;
}

.BfInfo {
    width: 100%;
    padding: 20px 15px;
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

h3 {
    margin: 0 0 15px 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
}

table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
}

th {
    width: 60px;
    padding: 10px 0;
    text-align: left;
    vertical-align: middle;
}

th label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #64748b;
    white-space: nowrap;
}

td {
    padding: 8px 12px 8px 2px;
    vertical-align: middle;
}
td:last-child {
    padding-right: 0;
}

select,
input[type='text'] {
    width: 100%;
    height: 38px;
    padding: 0 10px;
    font-size: 0.9rem;
    color: #334155;
    background-color: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.2s;
}

select:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

input[readonly] {
    color: #475569;
    background-color: #f8fafc;
    border-color: #e2e8f0;
}
</style>
