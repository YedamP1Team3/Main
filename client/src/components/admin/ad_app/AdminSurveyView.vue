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
.submit-box {
    margin-top: 50px;
    display: flex;
    justify-content: flex-end; /* 우측 정렬 유지 */
    gap: 12px; /* 버튼 사이 간격 */
}

.btn-danger {
    padding: 12px 40px;
    font-weight: 700;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #fef2f2;
    color: #ef4444;
    border: 1px solid #fca5a5;
}

.btn-danger:hover {
    background: #fee2e2;
    color: #dc2626;
}
/* 
  💡 새로운 파일이므로 기존 Member의 SurveyView.vue에 있던 CSS를 그대로 복사해 오시면 됩니다.
  아키텍처상 분리된 파일이므로 추가해야 할 특별한 스타일은 없으며, 
  버튼 배치를 우측으로 밀어주는 .submit-box 관련 CSS만 아래 내용이 포함되어 있는지 확인하십시오. 
*/

.submit-box {
    margin-top: 50px;
    display: flex;
    justify-content: flex-end; /* 우측 정렬 */
    gap: 12px;
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
