<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import SurveyItemWidget from '@/components/systemAdmin/serveyCreate/SurveyItemWidget.vue';
import SurveySubItemWidget from '@/components/systemAdmin/serveyCreate/SurveySubItemWidget.vue';
import SurveyDetailWidget from '@/components/systemAdmin/serveyCreate/SurveyDetailWidget.vue';

const surveyData = ref([]);
const versionList = ref([]);
const selectedVersionId = ref(null);
const currentVersion = ref('');

// 선택된 item / subItem 을 기준으로 가운데, 오른쪽 패널 데이터가 바뀐다.
const selectedItemId = ref(null);
const selectedSubItemId = ref(null);

const maxVersionId = computed(() => {
    if (versionList.value.length === 0) return 0;
    return Math.max(...versionList.value.map((version) => version.VERSION_ID));
});

// 가장 최신 version 만 수정 가능하고,
// 과거 version 은 조회 전용으로 남겨두는 구조다.
const isEditableVersion = computed(() => {
    return selectedVersionId.value === maxVersionId.value;
});

const currentSubItems = computed(() => surveyData.value.find((item) => item.id === selectedItemId.value)?.subItems || []);

const currentDetails = computed(() => {
    const item = surveyData.value.find((target) => target.id === selectedItemId.value);
    return item?.subItems.find((subItem) => subItem.id === selectedSubItemId.value)?.details || [];
});

const selectedItemName = computed(() => surveyData.value.find((item) => item.id === selectedItemId.value)?.name || '');
const selectedSubItemName = computed(() => currentSubItems.value.find((subItem) => subItem.id === selectedSubItemId.value)?.name || '');

const resetSelection = () => {
    selectedItemId.value = null;
    selectedSubItemId.value = null;
};

const fetchSurveyData = async (versionId) => {
    try {
        const { data } = await axios.get('/api/survey', { params: { versionId } });
        surveyData.value = data.items;
        currentVersion.value = data.version_id;
    } catch (error) {
        console.error('설문 구조 조회 실패:', error);
    }
};

const fetchVersionList = async () => {
    try {
        const { data } = await axios.get('/api/survey/versions');

        if (data.success) {
            versionList.value = data.versions;

            if (!selectedVersionId.value && data.versions.length > 0) {
                selectedVersionId.value = Math.max(...data.versions.map((version) => version.VERSION_ID));
            }
        }
    } catch (error) {
        console.error('설문 버전 목록 조회 실패:', error);
    }
};

const handleVersionChange = () => {
    resetSelection();
    fetchSurveyData(selectedVersionId.value);
};

const handleAddItem = async (name) => {
    const { data } = await axios.post('/api/survey/item', {
        item_name: name,
        version_id: currentVersion.value
    });

    if (data.success) {
        surveyData.value.push({
            id: data.item.item_id,
            name: data.item.item_name,
            subItems: []
        });
    }
};

const handleAddSubItem = async (name) => {
    const { data } = await axios.post('/api/survey/item/sub', {
        sub_item_name: name,
        item_id: selectedItemId.value
    });

    if (data.success) {
        const parent = surveyData.value.find((item) => item.id === selectedItemId.value);

        if (parent) {
            parent.subItems.push({
                id: data.item.sub_item_id,
                name: data.item.sub_item_name,
                details: []
            });
        }
    }
};

const handleAddDetail = async (text) => {
    const { data } = await axios.post('/api/survey/details', {
        sub_item_id: selectedSubItemId.value,
        question_text: text
    });

    if (data.success) {
        const parentSubItem = surveyData.value.find((item) => item.id === selectedItemId.value)?.subItems.find((subItem) => subItem.id === selectedSubItemId.value);

        if (parentSubItem) {
            parentSubItem.details.push({
                id: data.data.detail_id,
                question_text: data.data.question_text
            });
        }
    }
};

const handleDeleteSelected = async (ids) => {
    await axios.delete('/api/survey/delete-selected', { data: { ids } });
    await fetchSurveyData(selectedVersionId.value);
};

const handleDeleteItem = async (itemId) => {
    if (!confirm('해당 항목을 삭제하시겠습니까? 하위 항목도 함께 삭제됩니다.')) {
        return;
    }

    await axios.delete('/api/survey/delete-selected', {
        data: { ids: [`item-${itemId}`] }
    });

    if (selectedItemId.value === itemId) {
        resetSelection();
    }

    await fetchSurveyData(selectedVersionId.value);
};

const handleDeleteSubItem = async (subItemId) => {
    if (!confirm('해당 세부항목을 삭제하시겠습니까? 하위 질문도 함께 삭제됩니다.')) {
        return;
    }

    await axios.delete('/api/survey/delete-selected', {
        data: { ids: [`sub-${subItemId}`] }
    });

    if (selectedSubItemId.value === subItemId) {
        selectedSubItemId.value = null;
    }

    await fetchSurveyData(selectedVersionId.value);
};

// "적용"은 현재 선택 버전을 active 로 만들고,
// 동시에 다음 수정을 위한 새 draft version 을 만드는 작업이다.
const handleApplyVersion = async () => {
    if (!confirm('현재 선택한 버전을 활성화하고, 수정 가능한 새 설문 버전을 생성하시겠습니까?')) {
        return;
    }

    const { data } = await axios.post('/api/survey/version/new', {
        versionId: selectedVersionId.value
    });

    if (data.success) {
        alert('버전 적용이 완료되었고 새 설문 버전이 생성되었습니다.');
        await fetchVersionList();
        selectedVersionId.value = data.newVersionId;
        handleVersionChange();
    }
};

onMounted(async () => {
    await fetchVersionList();

    if (selectedVersionId.value) {
        await fetchSurveyData(selectedVersionId.value);
    }
});
</script>

<template>
    <div class="bg-slate-50 min-h-screen pt-[5rem] px-4 pb-8 md:px-6">
        <div class="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div class="flex items-center gap-3">
                <label class="font-bold text-slate-700">설문지 버전 선택:</label>
                <select v-model="selectedVersionId" @change="handleVersionChange" class="border rounded-lg p-2 bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-blue-500">
                    <option v-for="version in versionList" :key="version.VERSION_ID" :value="version.VERSION_ID">
                        버전 {{ version.VERSION_ID }}
                        {{ version.IS_ACTIVE === 1 ? '(현재 활성)' : version.VERSION_ID === maxVersionId ? '(수정 가능 draft)' : '' }}
                    </option>
                </select>
            </div>

            <button @click="handleApplyVersion" class="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-md">현재 버전 적용 및 새 설문 버전 생성</button>
        </div>

        <div class="grid grid-cols-12 gap-4 md:gap-6">
            <div class="col-span-12 lg:col-span-3">
                <SurveyItemWidget
                    :items="surveyData"
                    :selectedId="selectedItemId"
                    :isActive="isEditableVersion"
                    @select="
                        (id) => {
                            selectedItemId = id;
                            selectedSubItemId = null;
                        }
                    "
                    @add-item="handleAddItem"
                    @delete-item="handleDeleteItem"
                />
            </div>

            <div class="col-span-12 lg:col-span-3">
                <SurveySubItemWidget :subItems="currentSubItems" :selectedId="selectedSubItemId" :isActive="isEditableVersion" @select="(id) => (selectedSubItemId = id)" @add-sub-item="handleAddSubItem" @delete-sub-item="handleDeleteSubItem" />
            </div>

            <div class="col-span-12 lg:col-span-6">
                <SurveyDetailWidget
                    :details="currentDetails"
                    :selectedItemName="selectedItemName"
                    :selectedSubItemName="selectedSubItemName"
                    :selectedItemId="selectedItemId"
                    :selectedSubItemId="selectedSubItemId"
                    :isActive="isEditableVersion"
                    @add-detail="handleAddDetail"
                    @delete-selected="handleDeleteSelected"
                />
            </div>
        </div>
    </div>
</template>
