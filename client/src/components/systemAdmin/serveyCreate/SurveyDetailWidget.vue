<script setup>
import { ref } from 'vue';

const props = defineProps({
    details: Array,
    selectedItemName: String,
    selectedSubItemName: String,
    selectedItemId: Number,
    selectedSubItemId: Number,
    isActive: Boolean
});

const emit = defineEmits(['add-detail', 'delete-selected']);
const showInput = ref(false);
const newTitle = ref('');
const selectedItems = ref([]);

// ⭐️ 체크박스는 오직 Detail(질문) 영역만 통제하도록 수정
const toggleAll = () => {
    if (selectedItems.value.length > 0) selectedItems.value = [];
    else {
        selectedItems.value = props.details?.map((d) => 'detail-' + d.id) || [];
    }
};

const handleDelete = () => {
    if (selectedItems.value.length === 0) return alert('삭제할 질문을 선택해주세요.');
    if (confirm('선택한 질문을 삭제하시겠습니까?')) {
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
        <div class="bg-slate-50 border-b p-5 shrink-0">
            <div class="flex items-center justify-between mb-3">
                <h5 class="font-extrabold text-sm text-slate-500 tracking-widest">선택된 카테고리</h5>
                <div v-if="isActive" class="flex gap-4 items-center">
                    <button @click="toggleAll" class="text-sm font-bold text-slate-400 hover:text-blue-600">질문 전체선택</button>
                    <button @click="handleDelete" class="px-3 py-1.5 bg-red-50 text-red-600 rounded text-xs font-bold hover:bg-red-100">선택질문 삭제</button>
                </div>
            </div>
            <!-- 불필요한 부모 체크박스 제거, 순수 텍스트 표기만 남김 -->
            <div class="grid grid-cols-2 gap-3">
                <div v-if="selectedItemName" class="flex items-center gap-3 p-3 bg-white border rounded-lg">
                    <span class="text-sm font-bold truncate text-slate-700">{{ selectedItemName }}</span>
                </div>
                <div v-if="selectedSubItemName" class="flex items-center gap-3 p-3 bg-white border rounded-lg">
                    <span class="text-sm font-bold truncate text-slate-700">{{ selectedSubItemName }}</span>
                </div>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto p-5 custom-scrollbar bg-white">
            <ul v-if="details?.length" class="space-y-3">
                <li v-for="detail in details" :key="detail.id" class="flex items-start gap-3 p-4 bg-slate-50 border rounded-xl">
                    <input v-if="isActive" type="checkbox" v-model="selectedItems" :value="'detail-' + detail.id" class="mt-1 rounded border-slate-300" />
                    <p class="text-slate-700 text-sm font-semibold">{{ detail.question_text }}</p>
                </li>
            </ul>
            <p v-else class="text-slate-400 text-center py-10">질문이 없습니다.</p>

            <div v-if="showInput" class="mt-4 p-4 border-2 border-blue-500 rounded-xl">
                <textarea v-model="newTitle" placeholder="질문 입력..." class="w-full bg-transparent border-none focus:ring-0 text-sm font-semibold resize-none"></textarea>
                <div class="flex justify-end gap-2 mt-2">
                    <button @click="showInput = false" class="text-xs font-bold text-slate-400">취소</button>
                    <button @click="handleSubmit" class="bg-blue-600 text-white px-4 py-1.5 rounded text-xs font-bold">저장</button>
                </div>
            </div>
        </div>

        <div v-if="isActive && !showInput" class="p-4 bg-slate-50 border-t shrink-0">
            <button @click="showInput = true" class="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:border-blue-500 hover:text-blue-600 transition-colors">+ 새 질문 추가하기</button>
        </div>
    </div>
</template>
<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}
</style>
