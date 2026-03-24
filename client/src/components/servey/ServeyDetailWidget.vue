<script setup>
import { ref } from 'vue';

const props = defineProps({
    details: Array,
    selectedItemName: String,
    selectedSubItemName: String,
    selectedItemId: Number,
    selectedSubItemId: Number,
    isActive: Boolean // ⭐️ 부모가 준 true/false 값 받기
});

// [수정] 부모 컴포넌트(ServeyCreate)의 @save와 맞추기 위해 'save'로 변경
const emit = defineEmits(['add-detail', 'delete-selected', 'save']);

const showInput = ref(false);
const newTitle = ref('');
const selectedItems = ref([]);

const toggleAll = () => {
    if (selectedItems.value.length > 0) {
        selectedItems.value = [];
    } else {
        const allIds = [];
        if (props.selectedItemId) allIds.push('item-' + props.selectedItemId);
        if (props.selectedSubItemId) allIds.push('sub-' + props.selectedSubItemId);
        props.details?.forEach((d) => allIds.push('detail-' + d.id));
        selectedItems.value = allIds;
    }
};

const handleDeleteSelected = () => {
    if (selectedItems.value.length === 0) return alert('삭제할 항목을 선택해주세요.');
    if (confirm(`선택한 ${selectedItems.value.length}개의 항목을 삭제하시겠습니까?`)) {
        emit('delete-selected', selectedItems.value);
        selectedItems.value = [];
    }
};

const handleSubmit = () => {
    if (!newTitle.value.trim()) return;
    emit('add-detail', newTitle.value);
    newTitle.value = '';
    showInput.value = false;
};
</script>

<template>
    <div class="card bg-white shadow-xl rounded-2xl h-[40rem] flex flex-col border border-slate-100 overflow-hidden">
        <div class="bg-slate-50/80 border-b border-slate-100 p-5 shrink-0">
            <div v-if="isActive" class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                    <div class="w-1.5 h-4 bg-slate-800 rounded-full"></div>
                    <h5 class="font-extrabold text-sm text-slate-500 uppercase tracking-widest">선택항목</h5>
                </div>
                <div class="flex gap-5 items-center">
                    <button @click="toggleAll" class="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors">전체 선택</button>
                    <button @click="handleDeleteSelected" class="px-4 py-2 bg-red-50 text-red-600 rounded-md text-[13px] font-black hover:bg-red-100 active:scale-95 transition-all">선택 삭제</button>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div v-if="selectedItemName" class="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <input v-if="isActive" type="checkbox" v-model="selectedItems" :value="'item-' + selectedItemId" class="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer" />
                    <div class="flex-1 min-w-0">
                        <span class="text-[15px] font-bold text-slate-700 truncate block">{{ selectedItemName }}</span>
                    </div>
                </div>

                <div v-if="selectedSubItemName" class="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <input v-if="isActive" type="checkbox" v-model="selectedItems" :value="'sub-' + selectedSubItemId" class="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer" />
                    <div class="flex-1 min-w-0">
                        <span class="text-[15px] font-bold text-slate-700 truncate block">{{ selectedSubItemName }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto p-5 custom-scrollbar bg-white">
            <div class="flex items-center justify-between mb-4 px-1">
                <p class="text-sm font-black text-slate-300 uppercase tracking-[0.2em]">Questions List</p>
                <span class="text-sm font-bold text-blue-500 bg-blue-50 px-3 py-0.5 rounded-full">{{ details?.length || 0 }} 문항</span>
            </div>

            <ul v-if="details?.length > 0" class="space-y-3">
                <li v-for="detail in details" :key="detail.id" class="flex items-start gap-4 p-5 bg-slate-50/50 border border-slate-100 rounded-xl hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all">
                    <input v-if="isActive" type="checkbox" v-model="selectedItems" :value="'detail-' + detail.id" class="h-6 w-6 mt-0.5 rounded border-slate-300 text-blue-600 cursor-pointer focus:ring-0" />
                    <div class="flex-1 min-w-0">
                        <p class="text-slate-700 text-base font-semibold leading-relaxed">{{ detail.question_text }}</p>
                    </div>
                </li>
            </ul>

            <div v-else class="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                <p class="text-slate-300 text-sm font-bold uppercase tracking-widest text-center leading-loose">질문 데이터가 없습니다.</p>
            </div>

            <div v-if="showInput" class="mt-4 p-5 bg-white border-2 border-blue-500 rounded-xl shadow-xl animate-in zoom-in-95 duration-200">
                <textarea v-model="newTitle" placeholder="질문 내용을 입력하세요..." rows="2" class="w-full bg-transparent border-none focus:ring-0 text-base font-semibold text-slate-700 placeholder:text-slate-300 resize-none"></textarea>
                <div class="flex justify-end gap-3 mt-3 pt-3 border-t border-slate-50">
                    <button @click="showInput = false" class="px-4 py-2 text-[13px] font-bold text-slate-400 hover:text-slate-600">CANCEL</button>
                    <button @click="handleSubmit" class="bg-blue-600 text-white px-6 py-2 rounded-lg text-[13px] font-black shadow-lg shadow-blue-100">ADD QUESTION</button>
                </div>
            </div>
        </div>

        <div v-if="isActive" class="px-6 py-6 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
            <button v-if="!showInput" @click="showInput = true" class="group flex items-center gap-4 text-blue-600 font-black text-base uppercase tracking-wider hover:text-blue-700 transition-all">
                <span class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all text-2xl">+</span>
                질문 추가
            </button>
            <div v-else></div>

            <button @click="emit('save')" class="flex items-center gap-4 bg-slate-900 text-white px-10 py-4 rounded-xl font-black text-base tracking-widest hover:bg-blue-600 active:scale-95 transition-all shadow-xl shadow-slate-200 uppercase">
                버전 확정 및 저장
            </button>
        </div>
    </div>
</template>
