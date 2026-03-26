<template>
    <div class="bg-slate-50 min-h-screen pt-[5rem] px-4 pb-8 md:px-6">
        <div class="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div class="flex items-center gap-3">
                <label class="font-bold text-slate-700">조사지 버전 선택:</label>
                <select v-model="selectedVersionId" @change="handleVersionChange" class="border rounded-lg p-2 bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-blue-500">
                    <option v-for="ver in versionList" :key="ver.VERSION_ID" :value="ver.VERSION_ID">
                        버전 {{ ver.VERSION_ID }}
                        {{ ver.IS_ACTIVE === 1 ? '(현재 활성 TRUE)' : ver.VERSION_ID === maxVersionId ? '(새 조사지 FALSE)' : '' }}
                    </option>
                </select>
            </div>

            <button @click="handleApplyVersion" class="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-md">현재 버전 적용 및 새 조사지 생성</button>
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

const selectedItemId = ref(null);
const selectedSubItemId = ref(null);

// [핵심] 가장 큰 PK를 찾는 로직
const maxVersionId = computed(() => {
    if (versionList.value.length === 0) return 0;
    return Math.max(...versionList.value.map((v) => v.VERSION_ID));
});

// [상태 판별] 수정 가능한 버전은 '가장 큰 PK를 가진 새 조사지'만 가능
const isEditableVersion = computed(() => {
    return selectedVersionId.value === maxVersionId.value;
});

const currentSubItems = computed(() => surveyData.value.find((i) => i.id === selectedItemId.value)?.subItems || []);
const currentDetails = computed(() => {
    const item = surveyData.value.find((i) => i.id === selectedItemId.value);
    return item?.subItems.find((s) => s.id === selectedSubItemId.value)?.details || [];
});

const selectedItemName = computed(() => surveyData.value.find((i) => i.id === selectedItemId.value)?.name || '');
const selectedSubItemName = computed(() => currentSubItems.value.find((s) => s.id === selectedSubItemId.value)?.name || '');

const fetchSurveyData = async (vid) => {
    try {
        const { data } = await axios.get('/api/survey', { params: { versionId: vid } });
        surveyData.value = data.items;
        currentVersion.value = data.version_id;
    } catch (err) {
        console.error(err);
    }
};

const fetchVersionList = async () => {
    try {
        const { data } = await axios.get('/api/survey/versions');
        if (data.success) {
            versionList.value = data.versions;
            if (!selectedVersionId.value) {
                // 최초 진입 시 가장 큰 PK(새 조사지)를 기본으로 엽니다.
                selectedVersionId.value = Math.max(...data.versions.map((v) => v.VERSION_ID));
            }
        }
    } catch (err) {
        console.error(err);
    }
};

const handleVersionChange = () => {
    selectedItemId.value = selectedSubItemId.value = null;
    fetchSurveyData(selectedVersionId.value);
};

const handleAddItem = async (name) => {
    const { data } = await axios.post('/api/survey/item', { item_name: name, version_id: currentVersion.value });
    if (data.success) surveyData.value.push({ id: data.item.item_id, name: data.item.item_name, subItems: [] });
};

const handleAddSubItem = async (name) => {
    const { data } = await axios.post('/api/survey/item/sub', { sub_item_name: name, item_id: selectedItemId.value });
    if (data.success) {
        const parent = surveyData.value.find((it) => it.id === selectedItemId.value);
        if (parent) parent.subItems.push({ id: data.item.sub_item_id, name: data.item.sub_item_name, details: [] });
    }
};

const handleAddDetail = async (text) => {
    const { data } = await axios.post('/api/survey/details', { sub_item_id: selectedSubItemId.value, question_text: text });
    if (data.success) {
        const parentSub = surveyData.value.find((it) => it.id === selectedItemId.value)?.subItems.find((s) => s.id === selectedSubItemId.value);
        if (parentSub) parentSub.details.push({ id: data.data.detail_id, question_text: data.data.question_text });
    }
};

// 다중 상세 삭제
const handleDeleteSelected = async (ids) => {
    if (await axios.delete('/api/survey/delete-selected', { data: { ids } })) {
        fetchSurveyData(selectedVersionId.value);
    }
};

// 개별 항목/세부항목 X 삭제 로직
const handleDeleteItem = async (itemId) => {
    if (!confirm('해당 항목을 삭제하시겠습니까? (하위 항목 모두 삭제)')) return;
    if (await axios.delete('/api/survey/delete-selected', { data: { ids: [`item-${itemId}`] } })) {
        if (selectedItemId.value === itemId) {
            selectedItemId.value = selectedSubItemId.value = null;
        }
        fetchSurveyData(selectedVersionId.value);
    }
};

const handleDeleteSubItem = async (subId) => {
    if (!confirm('해당 세부항목을 삭제하시겠습니까? (하위 질문 모두 삭제)')) return;
    if (await axios.delete('/api/survey/delete-selected', { data: { ids: [`sub-${subId}`] } })) {
        if (selectedSubItemId.value === subId) selectedSubItemId.value = null;
        fetchSurveyData(selectedVersionId.value);
    }
};

// ⭐️ 변경된 저장(적용) 로직
const handleApplyVersion = async () => {
    if (!confirm('현재 선택한 버전을 활성화(TRUE)하고, 수정 가능한 새 조사지(FALSE)를 생성하시겠습니까?')) return;
    const { data } = await axios.post('/api/survey/version/new', { versionId: selectedVersionId.value });
    if (data.success) {
        alert('적용 완료 및 새 조사지가 생성되었습니다.');
        await fetchVersionList();
        // 생성 후 작성 전용인 최신 PK 버전으로 강제 이동
        selectedVersionId.value = data.newVersionId;
        handleVersionChange();
    }
};

onMounted(async () => {
    await fetchVersionList();
    if (selectedVersionId.value) fetchSurveyData(selectedVersionId.value);
});
</script>
