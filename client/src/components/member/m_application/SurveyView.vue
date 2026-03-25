<script setup>
// 1. 외부 라이브러리
import { storeToRefs } from 'pinia';
// 2. 로컬 스토어
import { useSurveyStore } from '@/stores/useSurveyStore';

const surveyStore = useSurveyStore();

// 💡 작성/수정 로직 없이, 오직 스토어에서 '조회용 데이터'만 꺼내옵니다.
const { view_survey_data, view_answers } = storeToRefs(surveyStore);
</script>

<template>
    <div class="survey-wrap">
        <h2>지원 신청서 조회</h2>

        <div class="confirm-notice"><i class="pi pi-file"></i> 제출된 신청서 내용입니다. (수정 불가)</div>

        <div class="confirm-scroll-area">
            <!-- 큰 카테고리 반복 -->
            <div v-for="item in view_survey_data" :key="'view_' + item.id" class="conf-item-box">
                <h4 class="conf-item-title">{{ item.name }}</h4>

                <!-- 소분류 반복 -->
                <div v-for="sub in item.subItems" :key="'view_sub_' + sub.id" class="conf-sub-box">
                    <h5 class="conf-sub-title">- {{ sub.name }}</h5>
                    <ul class="conf-list">
                        <!-- 실제 질문 및 답변 반복 -->
                        <li v-for="(detail, index) in sub.details" :key="'view_det_' + detail.id">
                            <div class="conf-q">
                                <span>{{ index + 1 }}.</span> {{ detail.question_text }}
                            </div>
                            <div class="conf-a" :class="view_answers[detail.id] ? 'ans-yes' : 'ans-no'">
                                {{ view_answers[detail.id] ? '예' : '아니오' }}
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- 닫기 버튼: 스토어의 closeSurvey 액션을 호출하여 화면을 닫음 -->
        <div class="submit-box">
            <button class="btn-secondary" @click="surveyStore.closeSurvey()">닫기</button>
        </div>
    </div>
</template>

<style scoped>
/* ========================================== */
/* 공통 레이아웃 스타일 */
/* ========================================== */
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

/* ========================================== */
/* 조회 화면 전용 스타일 */
/* ========================================== */
.confirm-notice {
    padding: 15px;
    margin-bottom: 20px;
    background-color: #f1f5f9;
    color: #475569;
    border-radius: 8px;
    font-weight: 600;
}

.confirm-scroll-area {
    max-height: 500px;
    overflow-y: auto;
    padding-right: 15px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background-color: #fafafa;
    padding: 20px;
}

/* 스크롤바 커스텀 */
.confirm-scroll-area::-webkit-scrollbar {
    width: 8px;
}
.confirm-scroll-area::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 4px;
}

.conf-item-box {
    margin-bottom: 30px;
}
.conf-item-title {
    font-size: 1.2rem;
    color: #1e293b;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 2px solid #cbd5e1;
}

.conf-sub-title {
    font-size: 1rem;
    color: #475569;
    margin: 10px 0;
}

.conf-list {
    list-style: none;
    padding: 0;
    margin: 0 0 20px 0;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
}

.conf-list li {
    display: flex;
    justify-content: space-between;
    padding: 15px;
    border-bottom: 1px solid #f1f5f9;
}
.conf-list li:last-child {
    border-bottom: none;
}

.conf-q {
    flex: 1;
    padding-right: 20px;
    line-height: 1.5;
}
.conf-a {
    font-weight: 700;
    min-width: 60px;
    text-align: center;
}
.ans-yes {
    color: #2563eb;
}
.ans-no {
    color: #dc2626;
}

/* 버튼 스타일 */
.submit-box {
    margin-top: 50px;
    text-align: right;
}

.submit-box button {
    padding: 12px 40px;
    font-weight: 700;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
}

.btn-secondary {
    background: #f1f5f9;
    color: #64748b;
    border-color: #cbd5e1 !important;
}
.btn-secondary:hover {
    background: #e2e8f0;
    color: #475569;
}
</style>
