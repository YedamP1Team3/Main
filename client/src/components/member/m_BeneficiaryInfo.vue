<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSurveyStore } from '@/stores/useSurveyStore';

const surveyStore = useSurveyStore();
const { my_beneficiaries, selected_bene_detail, selected_bene_id } = storeToRefs(surveyStore);

const localSelectedId = ref('');

const formattedGender = computed(() => {
    const gender = selected_bene_detail.value?.gender;
    if (gender === 'M') return '남자';
    if (gender === 'F') return '여자';
    return '';
});

const handleSelectChange = async () => {
    await surveyStore.selectBeneficiary(localSelectedId.value);
};

onMounted(async () => {
    if (surveyStore.my_beneficiaries.length === 0) {
        await surveyStore.fetchBeneficiaryList();
    }
});

watch(
    selected_bene_id,
    (newId) => {
        localSelectedId.value = newId || '';
    },
    { immediate: true }
);
</script>

<template>
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

                        <th><label>담당자</label></th>
                        <td><input type="text" :value="selected_bene_detail.manager_name || ''" readonly /></td>

                        <th><label>대기단계</label></th>
                        <!-- 수정됨: 클릭 이벤트 및 hover 클래스 제거 -->
                        <td>
                            <input type="text" :value="surveyStore.priorityStatusKor" readonly />
                        </td>
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
    border: 2px solid #f4e2de;
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

/* ⭐️ 클릭 가능한 대기단계 인풋을 위한 마우스 오버(Hover) 효과 */
.clickable-input {
    cursor: pointer;
    transition: all 0.2s;
}

.clickable-input:hover {
    border-color: #3b82f6 !important;
    background-color: #f0f8ff !important; /* 살짝 파란빛을 띄게 해서 클릭 유도 */
    box-shadow: inset 0 0 0 1px #3b82f6;
}
</style>
