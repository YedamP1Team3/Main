<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useSurveyStore } from '@/stores/useSurveyStore';
import { storeToRefs } from 'pinia';

// 스토어 연결
const surveyStore = useSurveyStore();
const { is_survey_visible } = storeToRefs(surveyStore);

const surveyData = ref([]);
const selectedTabId = ref(null);
const answers = ref({});

const fetchActiveSurvey = async () => {
    try {
        const response = await axios.get('/api/survey/active_survey');

        if (response.data.success) {
            surveyData.value = response.data.data.items;
            if (surveyData.value.length > 0) {
                selectedTabId.value = surveyData.value[0].id;
            }
        }
    } catch (error) {
        console.error('설문지 로드 실패:', error);
    }
};

const currentItem = computed(() => {
    return surveyData.value.find((item) => item.id === selectedTabId.value) || null;
});

onMounted(() => {
    fetchActiveSurvey();
});
</script>

<template>
    <div v-if="is_survey_visible" class="survey-wrap">
        <h2>지원 신청하기</h2>

        <nav class="tabs" v-if="surveyData.length > 0">
            <button v-for="item in surveyData" :key="item.id" :class="{ active: selectedTabId === item.id }" @click="selectedTabId = item.id">
                {{ item.name }}
            </button>
        </nav>
        <div v-else class="tabs">
            <p>등록된 설문 항목이 없습니다.</p>
        </div>

        <div v-if="currentItem">
            <section v-for="subItem in currentItem.subItems" :key="subItem.id" class="q-section">
                <h3>{{ subItem.name }}</h3>

                <ul v-if="subItem.details && subItem.details.length > 0">
                    <li v-for="(detail, index) in subItem.details" :key="detail.id">
                        <p>
                            <span>{{ index + 1 }}.</span> {{ detail.question_text }}
                        </p>
                        <div class="radios">
                            <label><input type="radio" :value="true" :name="'q_' + detail.id" v-model="answers[detail.id]" /> 예</label>
                            <label><input type="radio" :value="false" :name="'q_' + detail.id" v-model="answers[detail.id]" /> 아니오</label>
                        </div>
                    </li>
                </ul>
                <div v-else class="empty-msg">등록된 질문이 없습니다.</div>
            </section>
        </div>

        <div class="submit-box">
            <button>신청 하기</button>
        </div>
    </div>
</template>

<style scoped>
/* 기존 스타일 100% 유지 */
.survey-wrap {
    max-width: 850px;
    margin: 0 auto;
    color: #1e293b;
}

.survey-wrap h2 {
    margin-bottom: 30px;
    font-size: 1.5rem;
    font-weight: 700;
}

.tabs {
    display: flex;
    gap: 12px;
    margin-bottom: 40px;
}

.tabs button {
    padding: 10px 24px;
    font-weight: 600;
    color: #64748b;
    background: #f1f5f9;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.tabs button.active {
    color: #fff;
    background: #94a3b8;
}

.q-section {
    margin-bottom: 20px;
}

.q-section h3 {
    margin-bottom: 15px;
    font-size: 0.95rem;
    font-weight: 600;
    color: #64748b;
}

.q-section ul {
    margin: 0;
    padding: 0;
    list-style: none;
    border-top: 2px solid #334155;
}

.q-section li {
    display: flex;
    gap: 40px;
    justify-content: space-between;
    padding: 24px 10px;
    border-bottom: 1px solid #e2e8f0;
}

.q-section p {
    flex: 1;
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.6;
}

.q-section span {
    margin-right: 6px;
    font-weight: 700;
}

.radios {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    min-width: 140px;
    padding-top: 4px;
}

.radios label {
    display: flex;
    gap: 8px;
    align-items: center;
    font-weight: 500;
    cursor: pointer;
}

.radios input {
    width: 18px;
    height: 18px;
    accent-color: #475569;
}

.empty-msg {
    padding: 20px 10px;
    font-size: 0.9rem;
    color: #94a3b8;
}

.submit-box {
    margin-top: 50px;
    text-align: right;
}

.submit-box button {
    padding: 12px 40px;
    font-weight: 700;
    background: #fff;
    border: 1px solid #94a3b8;
    border-radius: 30px;
    cursor: pointer;
}

.submit-box button:hover {
    background: #f8fafc;
    border-color: #0f172a;
}
</style>
