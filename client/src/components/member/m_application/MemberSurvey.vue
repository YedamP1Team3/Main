<script setup>
import { storeToRefs } from 'pinia';
import { useSurveyStore } from '@/stores/useSurveyStore';
import SurveyWrite from './SurveyWrite.vue';
import SurveyView from './SurveyView.vue';

const surveyStore = useSurveyStore();

// 신청서 영역은 "작성"과 "조회"를 같은 자리에서 번갈아 보여준다.
// 실제로 어떤 컴포넌트를 그릴지는 store가 가진 모드값이 결정한다.
const { is_survey_visible, is_view_mode } = storeToRefs(surveyStore);
</script>

<template>
    <div v-if="is_survey_visible">
        <SurveyView v-if="is_view_mode" />
        <SurveyWrite v-else />
    </div>
</template>
