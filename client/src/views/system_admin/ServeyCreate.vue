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
        const response = await axios.get('/api/survey');

        // 서버에서 리턴한 { version_id, items } 구조를 분해 할당
        surveyData.value = response.data.items;
        currentVersion.value = response.data.version_id; // 이제 숫자가 들어감

        console.log('로드된 버전 ID:', currentVersion.value);
    } catch (error) {
        console.error('로드 실패:', error);
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

// 6 항목 추가 핸들러
const handleAddItem = async (name) => {
    if (!name.trim()) return;

    const payload = {
        item_name: name,
        version_id: currentVersion.value
    };

    try {
        const response = await axios.post('/api/survey/item', payload);

        if (response.data.success) {
            // 💡 [문제의 원인] 서버는 item_id, item_name으로 줍니다.
            // 💡 [해결책] 하지만 위젯은 id, name을 기다리고 있습니다.
            const serverItem = response.data.item;

            const formattedItem = {
                id: serverItem.item_id, // item_id -> id 매핑
                name: serverItem.item_name, // item_name -> name 매핑
                subItems: [] // 초기값 설정
            };

            // 이제 surveyData에 push하면 글자가 즉시 나타납니다!
            surveyData.value.push(formattedItem);
            console.log('추가된 항목 데이터 구조:', formattedItem);
        }
    } catch (error) {
        console.error('추가 실패:', error);
    }
};

const handleAddSubItem = async (name) => {
    if (!selectedItemId.value) return alert('먼저 상위 항목을 선택하세요.');

    const payload = {
        sub_item_name: name,
        item_id: selectedItemId.value // 현재 선택된 부모 ID
    };

    try {
        const response = await axios.post('/api/survey/item/sub', payload);

        if (response.data.success) {
            const serverSubItem = response.data.item;

            // 화면 즉시 반영: 현재 선택된 아이템의 subItems 배열에 추가
            const parentItem = surveyData.value.find((it) => it.id === selectedItemId.value);

            if (parentItem) {
                if (!parentItem.subItems) parentItem.subItems = [];
                parentItem.subItems.push({
                    id: serverSubItem.sub_item_id,
                    name: serverSubItem.sub_item_name
                });
            }
        }
    } catch (error) {
        console.error(error);
    }
};
const handleAddDetail = async (text) => {
    if (!selectedSubItemId.value) return alert('먼저 서브 항목을 선택하세요.');

    const payload = {
        sub_item_id: selectedSubItemId.value,
        question_text: text
    };

    try {
        const response = await axios.post('/api/survey/details', payload);

        if (response.data.success) {
            const serverDetail = response.data.data;

            // 1. 현재 선택된 상위 항목(Item) 찾기
            const parentItem = surveyData.value.find((it) => it.id === selectedItemId.value);

            if (parentItem) {
                // 2. 그 안에서 현재 선택된 서브 항목(SubItem) 찾기
                const parentSubItem = parentItem.subItems.find((s) => s.id === selectedSubItemId.value);

                if (parentSubItem) {
                    // 3. 서브 항목의 details 배열이 없으면 초기화 후 데이터 push
                    if (!parentSubItem.details) parentSubItem.details = [];

                    // 서브아이템 방식과 동일하게 구조 맞춰서 추가
                    parentSubItem.details.push({
                        id: serverDetail.detail_id, // PK 매핑
                        question_text: serverDetail.question_text // 내용 매핑
                    });
                }
            }
        }
    } catch (err) {
        console.error('질문 저장 실패:', err);
    }
};

// ServeyCreate.vue
const handleDeleteSelected = async (selectedIds) => {
    console.log('삭제 시도 IDs:', selectedIds); // 1. 데이터가 잘 찍히는지 확인

    try {
        const response = await axios.delete('/api/survey/delete-selected', {
            // 필수: delete 메서드는 본문을 data 키에 담아야 함
            data: { ids: selectedIds }
        });

        if (response.data.success) {
            alert('삭제 성공');
            // 화면 갱신 로직 실행...
            location.reload(); // 일단 삭제되는지 확인용으로 새로고침 넣어보세요.
        }
    } catch (err) {
        console.error('프론트 삭제 에러:', err.response?.data || err.message);
    }
};
// ServeyCreate.vue 스크립트 구역
const selectedItemName = computed(() => {
    const item = surveyData.value.find((i) => i.id === selectedItemId.value);
    // 콘솔에서 확인한 대로 'name' 필드를 참조합니다.
    return item ? item.name : '';
});

const selectedSubItemName = computed(() => {
    // currentSubItems도 내부 요소가 { id, name, ... } 구조일 테니 .name으로 참조
    const subItem = currentSubItems.value.find((s) => s.id === selectedSubItemId.value);
    return subItem ? subItem.name : '';
});

const isVersionListOpen = ref(false);
const allVersions = ref([1, 2, 3]); // 일단 테스트용 임시 데이터

// 버전 변경 시 실행될 함수
const handleVersionChange = async (versionId) => {
    currentVersion.value = versionId;
    isVersionListOpen.value = false;

    // 💡 여기서 해당 버전의 데이터를 다시 불러오는 API를 호출하게 될 겁니다.
    await fetchSurveyData(versionId);
};
</script>

<template>
    <div class="bg-slate-50 min-h-screen pt-[5rem] px-4 pb-8 md:px-6 overflow-y-auto max-h-[800px] overflow-y-auto">
        <div class="flex items-center gap-4 mb-6">
            <h1 class="text-2xl font-black text-slate-800">설문조사 관리</h1>

            <div class="relative">
                <button @click="isVersionListOpen = !isVersionListOpen" class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-500 transition-all">
                    <span class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Version</span>
                    <span class="text-sm font-bold text-slate-700">v{{ currentVersion }}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                <div v-if="isVersionListOpen" class="absolute top-full left-0 mt-2 w-40 bg-white border border-slate-100 shadow-xl rounded-xl z-50 overflow-hidden">
                    <ul class="max-h-60 overflow-y-auto">
                        <li v-for="ver in allVersions" :key="ver" @click="handleVersionChange(ver)" class="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors">Version {{ ver }}</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="grid grid-cols-12 gap-4 md:gap-6 h-auto">
            <div class="col-span-12 lg:col-span-3">
                <ServeyItemWidget :items="surveyData" :selectedId="selectedItemId" @select="handleSelectItem" @add-item="handleAddItem" />
            </div>

            <div class="col-span-12 lg:col-span-3">
                <ServeySubItemWidget :subItems="currentSubItems" :selectedId="selectedSubItemId" @select="handleSelectSubItem" @add-sub-item="handleAddSubItem" />
            </div>

            <div class="col-span-12 lg:col-span-6">
                <ServeyDetailWidget
                    :details="currentDetails"
                    :selectedItemName="selectedItemName"
                    :selectedSubItemName="selectedSubItemName"
                    :selectedItemId="selectedItemId"
                    :selectedSubItemId="selectedSubItemId"
                    @add-detail="handleAddDetail"
                    @delete-selected="handleDeleteSelected"
                />
            </div>
        </div>
    </div>
</template>
