<script setup>
import { ref, computed, onMounted } from 'vue';
import ServeyDetailWidget from '@/components/systemAdmin/serveyCreate/ServeyDetailWidget.vue';
import ServeyItemWidget from '@/components/systemAdmin/serveyCreate/ServeyItemWidget.vue';
import ServeySubItemWidget from '@/components/systemAdmin/serveyCreate/ServeySubItemWidget.vue';

// axios 서버연결
import axios from 'axios';

// [1] 상태 관리
const surveyData = ref([]);
const selectedItemId = ref(null);
const selectedSubItemId = ref(null);
const currentVersion = ref('');
const versionList = ref([]);
const selectedVersionId = ref(null);

// [2] 백엔드 데이터 불러오기 함수
const fetchSurveyData = async (vid) => {
    try {
        const response = await axios.get('/api/survey', { params: { versionId: vid } });
        surveyData.value = response.data.items;
        currentVersion.value = response.data.version_id;
    } catch (error) {
        console.error('로드 실패:', error);
    }
};

// 버전 목록을 불러오는 함수
const fetchVersionList = async () => {
    try {
        const response = await axios.get('/api/survey/versions');
        if (response.data.success) {
            versionList.value = response.data.versions;

            // 처음 로드 시, 활성화된(IS_ACTIVE === 1) 버전을 기본 선택값으로 지정
            const activeVersion = versionList.value.find((v) => v.IS_ACTIVE === 1);
            if (activeVersion) {
                selectedVersionId.value = activeVersion.VERSION_ID;
            } else if (versionList.value.length > 0) {
                selectedVersionId.value = versionList.value[0].VERSION_ID;
            }
        }
    } catch (error) {
        console.error('버전 목록 로드 실패:', error);
    }
};

// 사용자가 드롭다운에서 다른 버전을 선택했을 때 실행
const handleVersionChange = () => {
    selectedItemId.value = null;
    selectedSubItemId.value = null;
    fetchSurveyData(selectedVersionId.value);
};

// 저장버튼 들어내기
const isActiveVersion = computed(() => {
    const current = versionList.value.find((v) => v.VERSION_ID === selectedVersionId.value);
    return current?.IS_ACTIVE === 1; // 1이면 true, 아니면 false 반환
});

// [3] 라이프사이클: 초기 로드
onMounted(async () => {
    await fetchVersionList();
    if (selectedVersionId.value) {
        fetchSurveyData(selectedVersionId.value);
    }
});

// [4] 데이터 필터링 (Computed)
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

const selectedItemName = computed(() => {
    const item = surveyData.value.find((i) => i.id === selectedItemId.value);
    return item ? item.name : '';
});

const selectedSubItemName = computed(() => {
    const subItem = currentSubItems.value.find((s) => s.id === selectedSubItemId.value);
    return subItem ? subItem.name : '';
});

// [5] 선택 이벤트 핸들러
const handleSelectItem = (id) => {
    selectedItemId.value = id;
    selectedSubItemId.value = null;
};

const handleSelectSubItem = (id) => {
    selectedSubItemId.value = id;
};

// [6] 추가 및 생성 로직
const handleAddItem = async (name) => {
    if (!name.trim()) return;
    const payload = { item_name: name, version_id: currentVersion.value };
    try {
        const response = await axios.post('/api/survey/item', payload);
        if (response.data.success) {
            const serverItem = response.data.item;
            surveyData.value.push({
                id: serverItem.item_id,
                name: serverItem.item_name,
                subItems: []
            });
        }
    } catch (error) {
        console.error('추가 실패:', error);
    }
};

const handleAddSubItem = async (name) => {
    if (!selectedItemId.value) return alert('먼저 상위 항목을 선택하세요.');
    const payload = { sub_item_name: name, item_id: selectedItemId.value };
    try {
        const response = await axios.post('/api/survey/item/sub', payload);
        if (response.data.success) {
            const serverSubItem = response.data.item;
            const parentItem = surveyData.value.find((it) => it.id === selectedItemId.value);
            if (parentItem) {
                if (!parentItem.subItems) parentItem.subItems = [];
                parentItem.subItems.push({ id: serverSubItem.sub_item_id, name: serverSubItem.sub_item_name });
            }
        }
    } catch (error) {
        console.error(error);
    }
};

const handleAddDetail = async (text) => {
    if (!selectedSubItemId.value) return alert('먼저 서브 항목을 선택하세요.');
    const payload = { sub_item_id: selectedSubItemId.value, question_text: text };
    try {
        const response = await axios.post('/api/survey/details', payload);
        if (response.data.success) {
            const serverDetail = response.data.data;
            const parentItem = surveyData.value.find((it) => it.id === selectedItemId.value);
            if (parentItem) {
                const parentSubItem = parentItem.subItems.find((s) => s.id === selectedSubItemId.value);
                if (parentSubItem) {
                    if (!parentSubItem.details) parentSubItem.details = [];
                    parentSubItem.details.push({ id: serverDetail.detail_id, question_text: serverDetail.question_text });
                }
            }
        }
    } catch (err) {
        console.error('질문 저장 실패:', err);
    }
};

// [7] 삭제 및 버전 생성 로직
const handleDeleteSelected = async (selectedIds) => {
    try {
        const response = await axios.delete('/api/survey/delete-selected', { data: { ids: selectedIds } });
        if (response.data.success) {
            alert('삭제 성공');
            fetchSurveyData(selectedVersionId.value);
        }
    } catch (err) {
        console.error('프론트 삭제 에러:', err);
    }
};

// ⭐️ 핵심: 현재 상태 확정 및 새 버전 생성 (Save)
const handleCreateNewVersion = async () => {
    if (!confirm('현재 버전을 마감하고 새 버전을 생성하시겠습니까?')) return;
    try {
        const response = await axios.post('/api/survey/version/new');
        if (response.data.success) {
            alert('새 버전이 생성되었습니다.');
            await fetchVersionList();
            selectedVersionId.value = response.data.newVersionId;
            handleVersionChange();
        }
    } catch (err) {
        console.error('버전 생성 실패:', err);
    }
};
</script>

<template>
    <div class="bg-slate-50 min-h-screen pt-[5rem] px-4 pb-8 md:px-6">
        <div class="flex items-center gap-3 mb-6">
            <label class="font-bold">조사지 버전 선택:</label>
            <select v-model="selectedVersionId" @change="handleVersionChange" class="border rounded p-2 bg-white">
                <option v-for="ver in versionList" :key="ver.VERSION_ID" :value="ver.VERSION_ID">버전 {{ ver.VERSION_ID }} {{ ver.IS_ACTIVE === 1 ? '(현재 사용중)' : '' }}</option>
            </select>
        </div>

        <div class="grid grid-cols-12 gap-4 md:gap-6">
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
                    :is-active="isActiveVersion"
                    @add-detail="handleAddDetail"
                    @delete-selected="handleDeleteSelected"
                    @save="handleCreateNewVersion"
                />
            </div>
        </div>
    </div>
</template>
