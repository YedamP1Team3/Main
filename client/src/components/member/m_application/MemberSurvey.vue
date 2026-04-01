<!-- MemberSurvey.vue (스위치 역할로 변신) -->
<script setup>
import { storeToRefs } from 'pinia';
import { useSurveyStore } from '@/stores/useSurveyStore';

// 분리한 두 컴포넌트 임포트
import SurveyWrite from './SurveyWrite.vue';
import SurveyView from './SurveyView.vue';

const surveyStore = useSurveyStore();
// 스토어에서 화면 표시 여부와 모드를 꺼내옴
const { is_survey_visible, is_view_mode } = storeToRefs(surveyStore);
</script>

<template>
    <!-- 설문 모달이나 창이 열려있어야만 렌더링 -->
    <div v-if="is_survey_visible">
        <!-- 조회 모드면 SurveyView를, 아니면 SurveyWrite를 보여줌 -->
        <SurveyView v-if="is_view_mode" />
        <SurveyWrite v-else />
    </div>
</template>
