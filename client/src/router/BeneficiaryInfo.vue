<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// 1. 상태(데이터) 정의
const selectedBeneId = ref('');
const beneficiaryList = ref([]);
const selectedBene = ref({});

// 2. 지원자 선택 시 실행될 함수
const fetchBeneDetail = () => {
    const found = beneficiaryList.value.find((bene) => bene.bene_id === selectedBeneId.value);
    if (found) {
        selectedBene.value = found;
    }
};

onMounted(async () => {
    try {
        const response = await axios.get('http://localhost:3000/beneficiaries');
        if (response.data) {
            beneficiaryList.value = response.data;
        }
    } catch (error) {
        console.error('이유', error);
    }
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
                            <option v-for="bene in beneficiaryList" :key="bene.bene_id" :value="bene.bene_id">
                                {{ bene.bene_name }}
                            </option>
                        </select>
                    </td>

                    <th><label>보호자</label></th>
                    <td>
                        <input type="text" :value="selectedBene?.family_name || ''" readonly />
                    </td>

                    <th><label>대기단계</label></th>
                    <td>
                        <input type="text" :value="selectedBene?.wait_step || ''" readonly />
                    </td>
                </tr>

                <tr>
                    <th><label>성별</label></th>
                    <td>
                        <input type="text" :value="selectedBene?.gender || ''" readonly />
                    </td>

                    <th><label>생년월일</label></th>
                    <td>
                        <input type="text" :value="selectedBene?.birth_date || ''" readonly />
                    </td>

                    <th><label>장애유형</label></th>
                    <td>
                        <input type="text" :value="selectedBene?.disability_type || ''" readonly />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
