<script setup>
import { storeToRefs } from 'pinia';
import { useSurveyStore } from '@/stores/useSurveyStore';

const surveyStore = useSurveyStore();
// 💡 스토어에서 신청서 폼 데이터와 작성된 답변 데이터만 구독 (순수 읽기 전용)
const { view_survey_data, view_answers } = storeToRefs(surveyStore);

// 💡 부모 컴포넌트(ManagerMain / AdminMain)로 화면을 닫으라는 신호를 보냄
const emit = defineEmits(['close']);

const handleClose = () => {
    // 1. 스토어 내부에 찌꺼기가 남지 않도록 초기화
    surveyStore.closeSurvey();
    // 2. 부모의 viewMode를 'empty'로 변경하도록 이벤트 발송
    emit('close');
};
</script>

<template>
    <div class="survey-wrap">
        <h2>지원 신청서 상세 조회</h2>

        <!-- 💡 관리자/매니저용 안내 문구로 수정 (수정/삭제 불가 명시) -->
        <div class="confirm-notice"><i class="pi pi-info-circle"></i> 제출된 신청서의 열람 전용 화면입니다. (수정 및 삭제 불가)</div>

        <div class="confirm-scroll-area">
            <div v-for="item in view_survey_data" :key="'view_' + item.id" class="conf-item-box">
                <h4 class="conf-item-title">{{ item.name }}</h4>

                <div v-for="sub in item.subItems" :key="'view_sub_' + sub.id" class="conf-sub-box">
                    <h5 class="conf-sub-title">- {{ sub.name }}</h5>
                    <ul class="conf-list">
                        <li v-for="(detail, index) in sub.details" :key="'view_det_' + detail.id">
                            <div class="conf-q">
                                <span>{{ index + 1 }}.</span> {{ detail.question_text }}
                            </div>
                            <!-- 💡 작성된 답변에 따라 예/아니오 렌더링 -->
                            <div class="conf-a" :class="view_answers[detail.id] ? 'ans-yes' : 'ans-no'">
                                {{ view_answers[detail.id] ? '예' : '아니오' }}
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- 💡 위험한 삭제 버튼 제거, 오직 '닫기' 기능만 제공 -->
        <div class="submit-box">
            <button class="btn-secondary" @click="handleClose">닫기</button>
        </div>
    </div>
</template>

<style scoped>
/* ========================================== */
/* 공통 레이아웃 스타일 */
/* ========================================== */
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

/* ========================================== */
/* 조회 화면 전용 스타일 */
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

/* 스크롤바 커스텀 */
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

/* 리스트 컨테이너 배경은 연하게, 개별 요소는 하얗게 분리 */
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

/* 응답 텍스트 색상 */
.ans-yes {
    color: #ffab91;
}
.ans-no {
    color: #94a3b8;
}

/* 버튼 스타일 */
.submit-box {
    margin-top: 50px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.submit-box button {
    padding: 12px 40px;
    font-weight: 700;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.2s ease;
}

/* 닫기 버튼 */
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
</style>
