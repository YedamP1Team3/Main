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
    <div class="flex flex-col h-[40rem] bg-white shadow-md rounded-xl border border-slate-200 p-5">
        <div class="pb-4 shrink-0"><h5 class="font-bold text-xl text-slate-800">세부 항목</h5></div>

        <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <ul v-if="subItems?.length" class="space-y-2">
                <li
                    v-for="sub in subItems"
                    :key="sub.id"
                    @click="emit('select', sub.id)"
                    :class="['p-3 rounded-lg cursor-pointer transition-all border font-medium flex items-center justify-between', selectedId === sub.id ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-slate-50 hover:bg-slate-100']"
                >
                    <span class="truncate pr-2">{{ sub.name }}</span>
                    <div class="flex items-center gap-2 shrink-0">
                        <span v-if="selectedId === sub.id" class="text-emerald-500 text-xs">●</span>
                        <button v-if="isActive" @click.stop="emit('delete-sub-item', sub.id)" class="text-slate-400 hover:text-red-600 font-bold px-1 transition-colors">✕</button>
                    </div>
                </li>
            </ul>
            <p v-else class="text-slate-400 text-sm py-10 text-center">상위 항목을 선택하세요.</p>
        </div>

        <div v-if="isActive" class="pt-4 mt-4 border-t border-slate-100 shrink-0 flex gap-2">
            <input v-model="newSubItemName" type="text" @keyup.enter="handleAddSub" class="flex-1 bg-slate-50 border rounded-lg px-3 py-2 text-sm outline-none" placeholder="새 세부항목" />
            <button @click="handleAddSub" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700">추가</button>
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
