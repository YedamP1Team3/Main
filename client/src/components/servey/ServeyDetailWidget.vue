<script setup>
import { ref } from 'vue';

const props = defineProps({
    details: Array,
    selectedItemName: String,
    selectedSubItemName: String,
    selectedItemId: Number,
    selectedSubItemId: Number
});

// 필요 없는 개별 삭제(delete-item 등)는 다 날리고 통합 삭제만 남김
const emit = defineEmits(['add-detail', 'delete-selected', 'save-all']);

const showInput = ref(false);
const newTitle = ref('');
const selectedItems = ref([]); // 체크박스 선택된 ID들 (item-1, sub-5, detail-10 형태)

// [전체 선택/해제]
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

// [선택 삭제 실행] - 부모의 handleDeleteSelected 호출
const handleDeleteSelected = () => {
    if (selectedItems.value.length === 0) return alert('삭제할 항목을 선택해주세요.');
    if (confirm(`선택한 ${selectedItems.value.length}개의 항목을 삭제하시겠습니까?`)) {
        emit('delete-selected', selectedItems.value);
        selectedItems.value = []; // 삭제 요청 후 로컬 선택 상태 초기화
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
        <div class="bg-slate-50/80 border-b border-slate-100 p-4 shrink-0">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                    <div class="w-1 h-3.5 bg-slate-800 rounded-full"></div>
                    <h5 class="font-extrabold text-[11px] text-slate-500 uppercase tracking-widest">선택항목</h5>
                </div>
                <div class="flex gap-4 items-center">
                    <button @click="toggleAll" class="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors">전체 선택</button>
                    <button @click="handleDeleteSelected" class="px-3 py-1 bg-red-50 text-red-600 rounded-md text-[10px] font-black hover:bg-red-100 active:scale-95 transition-all">선택 삭제</button>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
                <div v-if="selectedItemName" class="flex items-center gap-3 p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <input type="checkbox" v-model="selectedItems" :value="'item-' + selectedItemId" class="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-0" />
                    <div class="flex-1 min-w-0">
                        <span class="text-[10px] font-bold text-slate-700 truncate block">{{ selectedItemName }}</span>
                    </div>
                </div>

                <div v-if="selectedSubItemName" class="flex items-center gap-3 p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <input type="checkbox" v-model="selectedItems" :value="'sub-' + selectedSubItemId" class="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-0" />
                    <div class="flex-1 min-w-0">
                        <span class="text-[10px] font-bold text-slate-700 truncate block">{{ selectedSubItemName }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white">
            <div class="flex items-center justify-between mb-3 px-1">
                <p class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Questions</p>
                <span class="text-[10px] font-bold text-slate-400">{{ details?.length || 0 }} 문항</span>
            </div>

            <ul v-if="details?.length > 0" class="space-y-2">
                <li v-for="detail in details" :key="detail.id" class="flex items-center gap-4 p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all">
                    <input type="checkbox" v-model="selectedItems" :value="'detail-' + detail.id" class="h-4 w-4 rounded border-slate-300 text-blue-600 cursor-pointer focus:ring-0" />
                    <div class="flex-1 min-w-0">
                        <p class="text-slate-600 text-[13px] font-medium leading-relaxed truncate">{{ detail.question_text }}</p>
                    </div>
                </li>
            </ul>

            <div v-else class="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-50 rounded-2xl bg-slate-50/30">
                <p class="text-slate-300 text-[10px] font-bold uppercase tracking-widest text-center leading-loose">질문 데이터가 없습니다.<br />하단의 추가 버튼을 이용하세요.</p>
            </div>

            <div v-if="showInput" class="mt-4 p-4 bg-white border-2 border-blue-500 rounded-xl shadow-xl animate-in zoom-in-95 duration-200">
                <textarea v-model="newTitle" placeholder="질문 내용을 입력하세요..." rows="2" class="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 placeholder:text-slate-300 resize-none"></textarea>
                <div class="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-50">
                    <button @click="showInput = false" class="px-3 py-1 text-[11px] font-bold text-slate-400 hover:text-slate-600">CANCEL</button>
                    <button @click="handleSubmit" class="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[11px] font-black shadow-lg shadow-blue-100">ADD QUESTION</button>
                </div>
            </div>
        </div>

        <div class="px-5 py-4 bg-white border-t border-slate-50 flex items-center justify-between shrink-0">
            <button v-if="!showInput" @click="showInput = true" class="group flex items-center gap-2 text-blue-600 font-black text-[11px] uppercase tracking-wider hover:text-blue-700 transition-all">
                <span class="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">+</span>
                질문 추가
            </button>
            <div v-else></div>

            <button @click="emit('save-all')" class="flex items-center gap-3 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[11px] tracking-widest hover:bg-blue-600 active:scale-95 transition-all shadow-xl shadow-slate-200 uppercase">
                버전 저장
            </button>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}
</style>
