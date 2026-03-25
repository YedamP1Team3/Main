<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// 💡 오타 수정: Survey... 로 이름 변경
import SurveyItemWidget from '@/components/systemAdmin/serveyCreate/SurveyItemWidget.vue';
import SurveySubItemWidget from '@/components/systemAdmin/serveyCreate/SurveySubItemWidget.vue';
import SurveyDetailWidget from '@/components/systemAdmin/serveyCreate/SurveyDetailWidget.vue';

const surveyData = ref([]);
const versionList = ref([]);
const selectedVersionId = ref(null);
const currentVersion = ref('');

const selectedItemId = ref(null);
const selectedSubItemId = ref(null);

// [상태 판별] 현재 선택된 버전이 활성(수정 가능) 상태인지 확인
const isActiveVersion = computed(() => {
    return versionList.value.find((v) => v.VERSION_ID === selectedVersionId.value)?.IS_ACTIVE === 1;
});

// [필터링] 자식에게 넘겨줄 하위 데이터 계산
const currentSubItems = computed(() => surveyData.value.find((i) => i.id === selectedItemId.value)?.subItems || []);
const currentDetails = computed(() => {
    const item = surveyData.value.find((i) => i.id === selectedItemId.value);
    return item?.subItems.find((s) => s.id === selectedSubItemId.value)?.details || [];
});

const selectedItemName = computed(() => surveyData.value.find((i) => i.id === selectedItemId.value)?.name || '');
const selectedSubItemName = computed(() => currentSubItems.value.find((s) => s.id === selectedSubItemId.value)?.name || '');

// [API] 데이터 로드
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
            selectedVersionId.value = data.versions.find((v) => v.IS_ACTIVE === 1)?.VERSION_ID || data.versions[0]?.VERSION_ID;
        }
    } catch (err) {
        console.error(err);
    }
};

// [이벤트] 선택 변경
const handleVersionChange = () => {
    selectedItemId.value = selectedSubItemId.value = null;
    fetchSurveyData(selectedVersionId.value);
};

// [API] 항목 추가 (대/중/소)
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

// [API] 삭제 및 저장
const handleDeleteSelected = async (ids) => {
    if (await axios.delete('/api/survey/delete-selected', { data: { ids } })) {
        alert('삭제 성공');
        fetchSurveyData(selectedVersionId.value);
    }
};

// ⭐️ 자식에게 있던 '저장' 로직을 부모로 끌어올림
const handleCreateNewVersion = async () => {
    if (!confirm('현재 버전을 마감하고 새 버전을 생성하시겠습니까?')) return;
    const { data } = await axios.post('/api/survey/version/new');
    if (data.success) {
        alert('새 버전이 생성되었습니다.');
        await fetchVersionList();
        selectedVersionId.value = data.newVersionId;
        handleVersionChange();
    }
};

onMounted(async () => {
    await fetchVersionList();
    if (selectedVersionId.value) fetchSurveyData(selectedVersionId.value);
});
</script>

<template>
    <div class="bg-slate-50 min-h-screen pt-[5rem] px-4 pb-8 md:px-6">
        <!-- ⭐️ 개선: 상단 헤더에 버전 선택과 '저장' 버튼을 나란히 배치하여 흐름을 명확히 함 -->
        <div class="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div class="flex items-center gap-3">
                <label class="font-bold text-slate-700">조사지 버전 선택:</label>
                <select v-model="selectedVersionId" @change="handleVersionChange" class="border rounded-lg p-2 bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-blue-500">
                    <option v-for="ver in versionList" :key="ver.VERSION_ID" :value="ver.VERSION_ID">버전 {{ ver.VERSION_ID }} {{ ver.IS_ACTIVE === 1 ? '(현재 사용중)' : '' }}</option>
                </select>
            </div>

            <!-- 활성 버전일 때만 마감(저장) 버튼 노출 -->
            <button v-if="isActiveVersion" @click="handleCreateNewVersion" class="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-md">버전 확정 및 새 버전 생성</button>
        </div>

        <div class="grid grid-cols-12 gap-4 md:gap-6">
            <div class="col-span-12 lg:col-span-3">
                <!-- ⭐️ 개선: isActive를 모든 자식에게 전달 -->
                <SurveyItemWidget
                    :items="surveyData"
                    :selectedId="selectedItemId"
                    :isActive="isActiveVersion"
                    @select="
                        (id) => {
                            selectedItemId = id;
                            selectedSubItemId = null;
                        }
                    "
                    @add-item="handleAddItem"
                />
            </div>

            <div class="col-span-12 lg:col-span-3">
                <SurveySubItemWidget :subItems="currentSubItems" :selectedId="selectedSubItemId" :isActive="isActiveVersion" @select="(id) => (selectedSubItemId = id)" @add-sub-item="handleAddSubItem" />
            </div>

            <div class="col-span-12 lg:col-span-6">
                <SurveyDetailWidget
                    :details="currentDetails"
                    :selectedItemName="selectedItemName"
                    :selectedSubItemName="selectedSubItemName"
                    :selectedItemId="selectedItemId"
                    :selectedSubItemId="selectedSubItemId"
                    :isActive="isActiveVersion"
                    @add-detail="handleAddDetail"
                    @delete-selected="handleDeleteSelected"
                />
            </div>
        </div>
    </div>
</template>
