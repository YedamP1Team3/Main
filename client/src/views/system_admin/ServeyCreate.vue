<script setup>
import { ref, computed, onMounted } from 'vue';
import ServeyDetailWidget from '@/components/servey/ServeyDetailWidget.vue';
import ServeyItemWidget from '@/components/servey/ServeyItemWidget.vue';
import ServeySubItemWidget from '@/components/servey/ServeySubItemWidget.vue';

// axios 서버연결
import axios from 'axios';

// [1] 상태 관리: 초기값은 빈 배열로 설정
const surveyData = ref([]);
const selectedItemId = ref(null);
const selectedSubItemId = ref(null);
const currentVersion = ref(''); // 상단에 표시할 버전 정보

// [2] 백엔드 데이터 불러오기 함수
const fetchSurveyData = async () => {
    try {
        // 실제 백엔드 API 엔드포인트로 변경하세요 (예: /api/survey/latest)
        const response = await axios.get('/api/survey');

        // 백엔드 응답 구조에 따라 데이터 할당
        // response.data가 우리가 짰던 [{id: 1, name: '...', subItems: [...]}] 구조라고 가정합니다.
        surveyData.value = response.data.items;
        currentVersion.value = response.data.version;

        console.log('DB 데이터 로드 완료:', surveyData.value);
    } catch (error) {
        console.error('데이터 로드 중 오류 발생:', error);
        alert('데이터를 불러오는 데 실패했습니다.');
    }
};

// [3] 라이프사이클: 페이지 접속 시 바로 실행
onMounted(() => {
    fetchSurveyData();
});

// [4] 선택된 ID에 따라 하위로 내려줄 데이터 필터링 (Computed)
const currentSubItems = computed(() => {
    const item = surveyData.value.find((i) => i.id === selectedItemId.value);
    return item ? item.subItems : [];
});

const currentDetails = computed(() => {
    const item = surveyData.value.find((i) => i.id === selectedItemId.value);
    if (!item) return [];
    const subItem = item.subItems.find((s) => s.id === selectedSubItemId.value);
    return subItem ? subItem.details : [];
});

// [5] 선택 이벤트 핸들러
const handleSelectItem = (id) => {
    selectedItemId.value = id;
    selectedSubItemId.value = null; // 상위 항목이 바뀌면 하위 선택은 초기화
};

const handleSelectSubItem = (id) => {
    selectedSubItemId.value = id;
};
</script>

<template>
    <div class="bg-slate-50 pt-[5rem] px-4 pb-4 md:px-6 md:pb-6">
        <div class="grid grid-cols-12 gap-4 md:gap-6 min-h-[calc(100vh-8rem)]">
            <div class="col-span-12 lg:col-span-3">
                <ServeyItemWidget :items="surveyData" :selectedId="selectedItemId" @select="handleSelectItem" />
            </div>

            <div class="col-span-12 lg:col-span-3">
                <ServeySubItemWidget :subItems="currentSubItems" :selectedId="selectedSubItemId" @select="handleSelectSubItem" />
            </div>

            <div class="col-span-12 lg:col-span-6">
                <ServeyDetailWidget :details="currentDetails" />
            </div>
        </div>
    </div>
</template>
