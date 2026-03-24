<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// 1. 상태 관리
const surveyData = ref([]); // 전체 설문 데이터
const selectedTabId = ref(null); // 현재 선택된 탭(항목) ID
const answers = ref({}); // 사용자 답변 저장용 { 질문ID: true/false }

// 2. 백엔드에서 활성화된 설문지 가져오기
const fetchActiveSurvey = async () => {
    console.log('👉 [프론트] 활성 설문지 데이터 요청 시작');
    try {
        // 백엔드 라우터 주소 (작성하신 이름 반영)
        const response = await axios.get('/api/survey/active_survey');

        if (response.data.success) {
            // response.data.data 안에는 { version_id: 1, items: [...] } 가 들어있습니다.
            surveyData.value = response.data.data.items;
            console.log('✅ [프론트] 데이터 수신 완료:', surveyData.value);

            // 💡 센스있는 처리: 데이터가 있으면 첫 번째 탭을 기본으로 선택해줌
            if (surveyData.value.length > 0) {
                selectedTabId.value = surveyData.value[0].id;
            }
        }
    } catch (error) {
        console.error('❌ [프론트 에러] 설문지 로드 실패:', error);
    }
};

// 3. 현재 선택된 탭(항목)의 데이터만 쏙 뽑아내는 계산된 속성(Computed)
const currentItem = computed(() => {
    // surveyData 안에서 id가 selectedTabId와 같은 놈을 찾아서 반환
    return surveyData.value.find((item) => item.id === selectedTabId.value) || null;
});

// 화면이 켜질 때 실행
onMounted(() => {
    fetchActiveSurvey();
});

// 기존 코드 아래에 이 함수를 추가해 주세요.
const submitSurvey = async () => {
    // 1. 빈 답변 방지 (선택적으로 체크)
    if (Object.keys(answers.value).length === 0) {
        alert('답변을 하나 이상 선택해주세요.');
        return;
    }

    // 2. 💡 핵심: 로그인 전이므로 가짜(Mock) 데이터를 섞어서 백엔드로 보낼 포장지를 만듭니다.
    const payload = {
        versionId: 1, // 방금 DB에서 활성화해둔 버전 ID (임시로 1이라고 가정)
        beneId: 999, // 임의의 대상자 ID (나중에 props로 받아올 예정)
        userId: 'test_manager_01', // 임의의 담당자 ID (나중에 로그인 세션에서 가져올 예정)
        answers: answers.value // 사용자가 방금 화면에서 누른 답변들 { "15": true, "16": false ... }
    };

    console.log('👉 [프론트] 백엔드로 전송할 데이터:', payload);

    // 3. 백엔드로 쏘기!
    try {
        const response = await axios.post('/api/survey/submit', payload);

        if (response.data.success) {
            alert(`✅ 제출 성공! (생성된 신청서 번호: ${response.data.appId})`);
            // 성공 후 답변 초기화 등 처리
        }
    } catch (error) {
        console.error('❌ [프론트 에러] 제출 실패:', error);
        alert('제출 중 오류가 발생했습니다. (F12 콘솔 확인)');
    }
};
</script>

<template>
    <div class="survey-wrap">
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
                            <span>{{ index + 1 }}.</span>
                            {{ detail.question_text }}
                        </p>

                        <div class="radios">
                            <label> <input type="radio" :value="true" :name="'q_' + detail.id" v-model="answers[detail.id]" /> 예 </label>
                            <label> <input type="radio" :value="false" :name="'q_' + detail.id" v-model="answers[detail.id]" /> 아니오 </label>
                        </div>
                    </li>
                </ul>
                <div v-else style="padding: 20px 10px; color: #94a3b8; font-size: 0.9rem">등록된 질문이 없습니다.</div>
            </section>
        </div>

        <div class="submit-box">
            <button @click="submitSurvey">신청 하기</button>
        </div>
    </div>
</template>

<style scoped>
/* 1. 전체 컨테이너 및 제목 */
.survey-wrap {
    max-width: 850px;
    margin: 0 auto;
    color: #1e293b;
}
.survey-wrap h2 {
    font-size: 1.5rem;
    margin-bottom: 30px;
    font-weight: 700;
}

/* 2. 탭 영역 (선 없이 여백으로만 분리) */
.tabs {
    display: flex;
    gap: 12px;
    margin-bottom: 40px;
}
.tabs button {
    padding: 10px 24px;
    border-radius: 6px;
    border: none;
    background: #f1f5f9;
    color: #64748b;
    font-weight: 600;
    cursor: pointer;
}
.tabs button.active {
    background: #94a3b8;
    color: #fff;
}

/* 3. 세부항목 및 질문 영역 */
.q-section {
    margin-bottom: 20px;
}
.q-section h3 {
    font-size: 0.95rem;
    color: #64748b;
    margin-bottom: 15px;
    font-weight: 600;
}
.q-section ul {
    list-style: none;
    padding: 0;
    margin: 0;
    border-top: 2px solid #334155;
}
.q-section li {
    display: flex;
    justify-content: space-between;
    gap: 40px;
    padding: 24px 10px;
    border-bottom: 1px solid #e2e8f0;
}

/* 질문 텍스트 강조 */
.q-section p {
    flex: 1;
    font-size: 1.05rem;
    line-height: 1.6;
    margin: 0;
}

.q-section span {
    font-weight: 700;
    margin-right: 6px;
}

/* 라디오 버튼 */
.radios {
    display: flex;
    gap: 24px;
    min-width: 140px;
    align-items: flex-start;
    padding-top: 4px;
}
.radios label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-weight: 500;
}
.radios input {
    width: 18px;
    height: 18px;
    accent-color: #475569;
}

/* 4. 하단 버튼 */
.submit-box {
    text-align: right;
    margin-top: 50px;
}
.submit-box button {
    padding: 12px 40px;
    border-radius: 30px;
    border: 1px solid #94a3b8;
    background: #fff;
    font-weight: 700;
    cursor: pointer;
}
.submit-box button:hover {
    background: #f8fafc;
    border-color: #0f172a;
}
</style>
