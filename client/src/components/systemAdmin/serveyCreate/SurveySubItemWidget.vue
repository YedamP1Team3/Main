<script setup>
import { ref } from 'vue';

const props = defineProps({ subItems: Array, selectedId: Number, isActive: Boolean });
const emit = defineEmits(['select', 'add-sub-item', 'delete-sub-item']); // delete-sub-item 추가
const newSubItemName = ref('');

const handleAddSub = () => {
    if (!newSubItemName.value.trim()) return;
    emit('add-sub-item', newSubItemName.value);
    newSubItemName.value = '';
};
</script>

<template>
    <div class="flex flex-col h-[40rem] bg-white shadow-md rounded-xl border-2 border-[#f4e2de] p-5">
        <div class="pb-4 shrink-0"><h5 class="font-bold text-2xl text-slate-800">세부 항목</h5></div>

        <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <ul v-if="subItems?.length" class="space-y-2">
                <li
                    v-for="sub in subItems"
                    :key="sub.id"
                    @click="emit('select', sub.id)"
                    :class="[
                        'p-3 rounded-lg cursor-pointer transition-all border-2 font-medium flex items-center justify-between text-lg' /* 리스트 항목 글자 크기 키움 (text-lg) */,
                        selectedId === sub.id ? 'bg-[#fef9f6] border-[#ffab91] text-[#ffab91]' : 'bg-white border-transparent hover:border-[#f4e2de]'
                    ]"
                >
                    <span class="truncate pr-2">{{ sub.name }}</span>
                    <div class="flex items-center gap-2 shrink-0">
                        <span v-if="selectedId === sub.id" class="text-[#ffab91] text-sm">●</span>
                        <button v-if="isActive" @click.stop="emit('delete-sub-item', sub.id)" class="text-slate-400 hover:text-[#ff8a65] font-bold px-1 transition-colors text-lg">✕</button>
                    </div>
                </li>
            </ul>
            <p v-else class="text-slate-400 text-base py-10 text-center">상위 항목을 선택하세요.</p>
        </div>

        <div v-if="isActive" class="pt-4 mt-4 border-t-2 border-[#f4e2de] shrink-0 flex gap-2">
            <input v-model="newSubItemName" type="text" @keyup.enter="handleAddSub" class="flex-1 bg-white border-2 border-[#f4e2de] rounded-lg px-3 py-2 text-base outline-none focus:border-[#ffab91]" placeholder="새 세부항목" />
            <button @click="handleAddSub" class="bg-[#ffab91] text-white px-4 py-2 rounded-lg text-base font-bold hover:bg-[#ff8a65] transition-colors shadow-sm">추가</button>
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
