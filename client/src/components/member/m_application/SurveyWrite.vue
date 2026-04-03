<script setup>
import { computed, onMounted, ref } from 'vue';
import axios from 'axios';
import { useSurveyStore } from '@/stores/useSurveyStore';
import { useAuthStore } from '@/stores/auth';

const surveyStore = useSurveyStore();
const authStore = useAuthStore();

// 설문 구조는 item -> subItem -> detail 계층으로 내려온다.
// 작성 화면에서는 현재 선택한 대분류(item)만 보여주므로 tab id를 따로 들고 있는다.
const surveyData = ref([]);
const selectedTabId = ref(null);
const currentVersionId = ref(null);

// answers 객체는 "detail id -> true/false" 형태다.
// 설문 문항 id를 key로 쓰면 서버에 보낼 때도 그대로 재사용할 수 있어 구조가 단순해진다.
const answers = ref({});

// 작성 화면과 최종 확인 화면을 분리해 두면
// 사용자가 제출 전에 한 번 더 검토할 수 있어 실수 제출을 줄일 수 있다.
const isConfirmMode = ref(false);

const getResponseData = (response) => {
    return response?.data?.success ? response.data.data : null;
};

const currentItem = computed(() => {
    return surveyData.value.find((item) => item.id === selectedTabId.value) || null;
});

const totalQuestionCount = computed(() => {
    return surveyData.value.reduce((count, item) => {
        return count + item.subItems.reduce((subCount, subItem) => subCount + (subItem.details?.length || 0), 0);
    }, 0);
});

const answeredQuestionCount = computed(() => Object.keys(answers.value).length);

const resetFormState = () => {
    answers.value = {};
    isConfirmMode.value = false;
};

const fetchActiveSurvey = async () => {
    try {
        const response = await axios.get('/api/survey/active_survey');
        const activeSurvey = getResponseData(response);

        surveyData.value = activeSurvey?.items || [];
        currentVersionId.value = activeSurvey?.version_id || null;
        selectedTabId.value = surveyData.value.length > 0 ? surveyData.value[0].id : null;
    } catch (error) {
        console.error('설문지 로드 실패:', error);
        surveyData.value = [];
        currentVersionId.value = null;
        selectedTabId.value = null;
    }
};

const goToConfirmMode = () => {
    if (!surveyStore.selected_bene_id) {
        alert('왼쪽에서 지원대상자를 먼저 선택해 주세요.');
        return;
    }

    if (answeredQuestionCount.value < totalQuestionCount.value) {
        alert(`체크하지 않은 문항이 있습니다.\n(총 ${totalQuestionCount.value}문항 중 ${answeredQuestionCount.value}문항 답변 완료)`);
        return;
    }

    isConfirmMode.value = true;
};

const submitSurvey = async () => {
    const payload = {
        bene_id: surveyStore.selected_bene_id,
        version_id: currentVersionId.value,
        user_id: authStore.userName,
        answers: answers.value
    };

    try {
        const response = await axios.post('/api/survey/submit', payload);

        if (response.data?.success) {
            alert('지원신청서가 정상적으로 접수되었습니다.');

            resetFormState();
            surveyStore.closeSurvey();
            await surveyStore.fetchApplicationList(surveyStore.selected_bene_id);
        }
    } catch (error) {
        console.error('지원신청서 제출 실패:', error);
        alert('지원신청서 제출 중 오류가 발생했습니다.');
    }
};

onMounted(() => {
    fetchActiveSurvey();
});
</script>

<template>
    <div class="survey-wrap">
        <h2>지원 신청하기</h2>

        <template v-if="!isConfirmMode">
            <nav class="tabs" v-if="surveyData.length > 0">
                <button v-for="item in surveyData" :key="item.id" :class="{ active: selectedTabId === item.id }" @click="selectedTabId = item.id">
                    {{ item.name }}
                </button>
            </nav>
            <div v-else class="tabs">
                <p>등록된 설문 문항이 없습니다.</p>
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
                <button class="btn-primary" @click="goToConfirmMode">신청서 검토하기</button>
            </div>
        </template>

        <template v-else>
            <div class="confirm-notice"><i class="pi pi-info-circle"></i> 아래 작성한 내용을 최종 확인해 주세요.</div>

            <div class="confirm-scroll-area">
                <div v-for="item in surveyData" :key="'conf_' + item.id" class="conf-item-box">
                    <h4 class="conf-item-title">{{ item.name }}</h4>

                    <div v-for="sub in item.subItems" :key="'conf_sub_' + sub.id" class="conf-sub-box">
                        <h5 class="conf-sub-title">- {{ sub.name }}</h5>
                        <ul class="conf-list">
                            <li v-for="(detail, index) in sub.details" :key="'conf_det_' + detail.id">
                                <div class="conf-q">
                                    <span>{{ index + 1 }}.</span> {{ detail.question_text }}
                                </div>
                                <div class="conf-a" :class="answers[detail.id] ? 'ans-yes' : 'ans-no'">
                                    {{ answers[detail.id] ? '예' : '아니오' }}
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="submit-box dual-buttons">
                <button class="btn-secondary" @click="isConfirmMode = false">취소 (수정하기)</button>
                <button class="btn-primary" @click="submitSurvey">최종 제출</button>
            </div>
        </template>
    </div>
</template>

<style scoped>
.survey-wrap {
    /* 기존 850px에서 1000px로 변경 */
    max-width: 1100px;
    margin: 0 auto;
    color: #1e293b;
}

/* 질문과 라디오 버튼 사이의 여백이 너무 멀어지지 않도록 간격 조정 */
.q-section li {
    display: flex;
    gap: 60px; /* 간격을 살짝 넓혀서 여백을 자연스럽게 채움 */
    justify-content: space-between;
    padding: 24px 10px;
}

.survey-wrap h2 {
    margin-bottom: 30px;
    font-size: 2rem;
    font-weight: 700;
}

/* 탭 메뉴 스타일 */
.tabs {
    display: flex;
    gap: 12px;
    margin-bottom: 40px;
}

.tabs button {
    padding: 10px 24px;
    font-weight: 600;
    color: #ffab91;
    background: #fff;
    border: 2px solid #f4e2de;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.tabs button:hover {
    background: #fef9f6;
    border-color: #ffab91;
}

.tabs button.active {
    color: #fff;
    background: #ffab91;
    border-color: #ffab91;
    box-shadow: 0 2px 4px rgba(255, 171, 145, 0.3);
}

.q-section {
    margin-bottom: 20px;
}

.q-section h3 {
    margin-bottom: 15px;
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffab91;
}

.q-section ul {
    margin: 0;
    padding: 0;
    list-style: none;
    border-top: 2px solid #f4e2de;
}

.q-section li {
    display: flex;
    gap: 40px;
    justify-content: space-between;
    padding: 24px 10px;
    border-bottom: 2px solid #f4e2de;
}

.q-section p {
    flex: 1;
    margin: 0;
    font-size: 1.2rem;
    line-height: 1.6;
}

.q-section span {
    margin-right: 6px;
    font-weight: 700;
    color: #ffab91;
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
    font-weight: 600;
    cursor: pointer;
    color: #475569;
}

/* 라디오 버튼 포인트 컬러 적용 */
.radios input {
    width: 18px;
    height: 18px;
    accent-color: black;
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

.dual-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
}

.submit-box button {
    padding: 12px 40px;
    font-weight: 700;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.2s ease;
}

/* 주요 제출 버튼 */
.btn-primary {
    background: #ffab91;
    border: 2px solid #ffab91;
    color: #fff;
    box-shadow: 0 2px 4px rgba(255, 171, 145, 0.3);
}

.btn-primary:hover {
    background: #ff8a65;
    border-color: #ff8a65;
}

/* 취소/돌아가기 버튼 */
.btn-secondary {
    background: #fff;
    color: #ffab91;
    border: 2px solid #f4e2de;
}

.btn-secondary:hover {
    background: #fef9f6;
    color: #ff8a65;
    border-color: #ff8a65;
}

/* ========================================== */
/* 미리보기(확인) 모드 스타일 */
/* ========================================== */
.confirm-notice {
    padding: 15px;
    margin-bottom: 20px;
    background-color: #fef9f6;
    color: #ffab91;
    border: 2px solid #f4e2de;
    border-radius: 8px;
    font-weight: 700;
}

.confirm-scroll-area {
    max-height: 500px;
    overflow-y: auto;
    padding: 20px;
    border: 2px solid #f4e2de;
    border-radius: 8px;
    background-color: #fff;
}

.confirm-scroll-area::-webkit-scrollbar {
    width: 8px;
}

.confirm-scroll-area::-webkit-scrollbar-thumb {
    background-color: #f4e2de;
    border-radius: 4px;
}

.conf-item-box {
    margin-bottom: 30px;
}

.conf-item-title {
    font-size: 1.7rem;
    color: #1e293b;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 2px solid #f4e2de;
}

.conf-sub-title {
    font-size: 1.4rem;
    color: #ffab91;
    font-weight: 600;
    margin: 10px 0;
}

.conf-list {
    list-style: none;
    padding: 4px;
    margin: 0 0 20px 0;
    background: #fef9f6;
    border: 2px solid #f4e2de;
    border-radius: 8px;
}

.conf-list li {
    display: flex;
    justify-content: space-between;
    padding: 15px;
    margin-bottom: 4px;
    background: #fff;
    border: 2px solid #f4e2de;
    border-radius: 6px;
    font-size: 1.2rem;
}

.conf-list li:last-child {
    margin-bottom: 0;
}

.conf-q {
    flex: 1;
    padding-right: 20px;
    line-height: 1.5;
}

.conf-q span {
    color: #ffab91;
    font-weight: bold;
}

.conf-a {
    font-weight: 700;
    min-width: 60px;
    text-align: center;
}

.ans-yes {
    color: #ffab91;
}

.ans-no {
    color: #94a3b8;
}
</style>
