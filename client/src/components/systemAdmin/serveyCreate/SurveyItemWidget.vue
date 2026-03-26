<template>
    <div class="flex flex-col h-[40rem] bg-white shadow-md rounded-xl border border-slate-200 p-5">
        <div class="pb-4 shrink-0"><h5 class="font-bold text-xl text-slate-800">지원서 항목</h5></div>

        <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <ul class="space-y-2">
                <li
                    v-for="item in items"
                    :key="item.id"
                    @click="emit('select', item.id)"
                    :class="['p-3 rounded-lg cursor-pointer transition-all border font-medium flex items-center justify-between', selectedId === item.id ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-slate-50 hover:bg-slate-100']"
                >
                    <span class="truncate pr-2">{{ item.name }}</span>
                    <div class="flex items-center gap-2 shrink-0">
                        <span v-if="selectedId === item.id" class="text-blue-500 text-xs">●</span>
                        <button v-if="isActive" @click.stop="emit('delete-item', item.id)" class="text-slate-400 hover:text-red-600 font-bold px-1 transition-colors">✕</button>
                    </div>
                </li>
            </ul>
            <p v-if="!items?.length" class="text-slate-400 text-sm py-10 text-center">등록된 항목이 없습니다.</p>
        </div>

        <div v-if="isActive" class="pt-4 mt-4 border-t border-slate-100 shrink-0 flex gap-2">
            <input v-model="newItemName" type="text" @keyup.enter="handleAdd" class="flex-1 bg-slate-50 border rounded-lg px-3 py-2 text-sm outline-none" placeholder="새 항목 이름" />
            <button @click="handleAdd" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">추가</button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({ items: Array, selectedId: Number, isActive: Boolean });
const emit = defineEmits(['select', 'add-item', 'delete-item']); // delete-item 추가
const newItemName = ref('');

const handleAdd = () => {
    if (!newItemName.value.trim()) return;
    emit('add-item', newItemName.value);
    newItemName.value = '';
};
</script>
<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}
</style>
