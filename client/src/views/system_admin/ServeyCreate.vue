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

// 선택된 item / subItem을 따로 들고 있어야
// 3단 패널 구조에서 어떤 목록을 보여줘야 하는지 즉시 계산할 수 있다.
const selectedItemId = ref(null);
const selectedSubItemId = ref(null);

// [추가 1] 모달 표시 여부를 관리하는 상태값
const showPreviewModal = ref(false);

const getResponseData = (response, fallbackValue = null) => {
    return response?.data?.success ? response.data.data : fallbackValue;
};

const getVersionId = (version) => version?.version_id ?? version?.VERSION_ID;
const getIsActive = (version) => version?.is_active ?? version?.IS_ACTIVE;

const maxVersionId = computed(() => {
    if (versionList.value.length === 0) return 0;
    return Math.max(...versionList.value.map((version) => getVersionId(version)));
});

// 최신 draft 버전만 수정 가능하고,
// 이미 운영에 쓰인 과거 버전은 조회 전용으로 두는 정책이다.
const isEditableVersion = computed(() => {
    return selectedVersionId.value === maxVersionId.value;
});

const currentSubItems = computed(() => {
    return surveyData.value.find((item) => item.id === selectedItemId.value)?.subItems || [];
});

const currentDetails = computed(() => {
    const item = surveyData.value.find((target) => target.id === selectedItemId.value);
    return item?.subItems.find((subItem) => subItem.id === selectedSubItemId.value)?.details || [];
});

const selectedItemName = computed(() => {
    return surveyData.value.find((item) => item.id === selectedItemId.value)?.name || '';
});

const selectedSubItemName = computed(() => {
    return currentSubItems.value.find((subItem) => subItem.id === selectedSubItemId.value)?.name || '';
});

const resetSelection = () => {
    selectedItemId.value = null;
    selectedSubItemId.value = null;
};

const fetchSurveyData = async (versionId) => {
    try {
        const response = await axios.get('/api/survey', { params: { versionId } });
        const payload = getResponseData(response, response.data);

        surveyData.value = payload?.items || [];
        currentVersion.value = payload?.version_id || versionId;
    } catch (error) {
        console.error('설문 구조 조회 실패:', error);
    }
};

const fetchVersionList = async () => {
    try {
        const response = await axios.get('/api/survey/versions');
        const successData = getResponseData(response);
        const versions = Array.isArray(successData) ? successData : Array.isArray(response.data?.versions) ? response.data.versions : [];

        versionList.value = versions;

        if (!selectedVersionId.value && versions.length > 0) {
            selectedVersionId.value = Math.max(...versions.map((version) => getVersionId(version)));
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
        const createdItem = data.item || data.data;

        surveyData.value.push({
            id: createdItem.item_id,
            name: createdItem.item_name,
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
        const createdSubItem = data.item || data.data;
        const parent = surveyData.value.find((item) => item.id === selectedItemId.value);

        if (parent) {
            parent.subItems.push({
                id: createdSubItem.sub_item_id,
                name: createdSubItem.sub_item_name,
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
        const createdDetail = data.data;
        const parentSubItem = surveyData.value.find((item) => item.id === selectedItemId.value)?.subItems.find((subItem) => subItem.id === selectedSubItemId.value);

        if (parentSubItem) {
            parentSubItem.details.push({
                id: createdDetail.detail_id,
                question_text: createdDetail.question_text
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

// 1) 버튼 클릭 시 미리보기 모달 열기
const openPreviewModal = () => {
    // surveyData가 비어있는지 방어 로직 (선택사항)
    if (!surveyData.value || surveyData.value.length === 0) {
        alert('등록된 설문 항목이 없습니다.');
        return;
    }
    showPreviewModal.value = true;
};

// 2) 모달 안에서 '확인'을 눌렀을 때 실제 적용하는 로직
const confirmAndApplyVersion = async () => {
    const { data } = await axios.post('/api/survey/version/new', {
        versionId: selectedVersionId.value
    });

    if (data.success) {
        alert('버전 적용이 완료되었고 새 설문 버전이 생성되었습니다.');
        await fetchVersionList();
        selectedVersionId.value = data.newVersionId ?? data.data?.new_version_id;
        handleVersionChange();
        showPreviewModal.value = false; // 완료 후 모달 닫기
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
    <div class="bg-[#fef9f6] min-h-screen pt-[5rem] px-4 pb-8 md:px-6">
        <div class="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border-2 border-[#f4e2de]">
            <div class="flex items-center gap-3">
                <label class="font-bold text-slate-700">설문지 버전 선택:</label>
                <select v-model="selectedVersionId" @change="handleVersionChange" class="border-2 border-[#f4e2de] rounded-lg p-2 bg-white font-medium outline-none focus:ring-2 focus:ring-[#ffab91] focus:border-[#ffab91]">
                    <option v-for="version in versionList" :key="getVersionId(version)" :value="getVersionId(version)">
                        버전 {{ getVersionId(version) }}
                        {{ getIsActive(version) === 1 ? '(현재 활성)' : getVersionId(version) === maxVersionId ? '(수정 가능 draft)' : '' }}
                    </option>
                </select>
            </div>

            <button @click="openPreviewModal" class="bg-[#ffab91] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#ff8a65] transition-colors shadow-md">현재 버전 적용 및 새 설문 버전 생성</button>
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

        <div v-if="showPreviewModal" class="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div class="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                <div @click="showPreviewModal = false" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" aria-hidden="true"></div>

                <div class="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full sm:max-w-4xl max-h-[calc(100vh-15rem)] flex flex-col mt-20">
                    <button @click="showPreviewModal = false" class="absolute top-6 right-6 text-slate-400 hover:text-[#ff8a65] transition-colors z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div class="px-8 pt-8 pb-6 border-b-2 border-[#f4e2de] shrink-0">
                        <h3 class="text-2xl font-extrabold text-slate-900 tracking-tight" id="modal-title">설문지 미리보기</h3>
                        <p class="text-base text-slate-500 mt-1.5 font-medium">최종 적용 전, 질문이 올바른지 확인해주세요.</p>
                    </div>

                    <div class="p-8 overflow-y-auto flex-1 bg-[#fef9f6] confirm-scroll-area">
                        <div v-for="item in surveyData" :key="'preview_' + item.id" class="mb-8 last:mb-0 border-2 border-[#f4e2de] bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                            <h4 class="text-xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-[#f4e2de]"><span class="text-[#ffab91] mr-2">Q.</span>{{ item.name }}</h4>

                            <div v-for="sub in item.subItems" :key="'preview_sub_' + sub.id" class="mb-6 last:mb-0">
                                <h5 class="text-base font-semibold text-[#ffab91] mb-3 ml-1 flex items-center gap-1.5">
                                    <span class="w-1.5 h-1.5 rounded-full bg-[#ffab91]"></span>
                                    {{ sub.name }}
                                </h5>

                                <ul class="divide-y-2 divide-[#f4e2de] border-2 border-[#f4e2de] rounded-xl bg-[#fef9f6]/50">
                                    <li v-for="(detail, index) in sub.details" :key="'preview_det_' + detail.id" class="p-4 flex items-start gap-3.5 hover:bg-white rounded-lg transition-colors">
                                        <span class="font-mono font-bold text-slate-400 shrink-0 pt-0.5 text-xs w-5 text-right">
                                            {{ String(index + 1).padStart(2, '0') }}
                                        </span>
                                        <span class="text-sm text-slate-700 font-medium leading-relaxed">
                                            {{ detail.question_text }}
                                        </span>
                                    </li>
                                    <li v-if="!sub.details || sub.details.length === 0" class="p-6 text-sm text-slate-400 text-center italic bg-white rounded-lg">등록된 질문이 없습니다.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="px-8 py-6 border-t-2 border-[#f4e2de] bg-white flex justify-end gap-3.5 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.03)]">
                        <button @click="showPreviewModal = false" class="px-5 py-2.5 text-sm rounded-xl font-bold bg-white text-[#ff8a65] hover:bg-[#fef9f6] transition-colors border-2 border-[#f4e2de]">돌아가기</button>
                        <button @click="confirmAndApplyVersion" class="px-5 py-2.5 text-sm rounded-xl font-bold bg-[#ffab91] text-white hover:bg-[#ff8a65] transition-colors shadow-sm shadow-[#ffab91]/30">버전 적용 및 생성</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
