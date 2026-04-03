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

<template>
    <div class="flex flex-col h-[40rem] bg-white shadow-md rounded-xl border-2 border-[#f4e2de] p-5">
        <div class="pb-4 shrink-0"><h5 class="font-bold text-xl text-slate-800">지원서 항목</h5></div>

        <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <ul class="space-y-2">
                <li
                    v-for="item in items"
                    :key="item.id"
                    @click="emit('select', item.id)"
                    :class="[
                        'p-3 rounded-lg cursor-pointer transition-all border-2 font-medium flex items-center justify-between',
                        selectedId === item.id ? 'bg-[#fef9f6] border-[#ffab91] text-[#ffab91]' : 'bg-white border-transparent hover:border-[#f4e2de]'
                    ]"
                >
                    <span class="truncate pr-2">{{ item.name }}</span>
                    <div class="flex items-center gap-2 shrink-0">
                        <span v-if="selectedId === item.id" class="text-[#ffab91] text-xs">●</span>
                        <button v-if="isActive" @click.stop="emit('delete-item', item.id)" class="text-slate-400 hover:text-[#ff8a65] font-bold px-1 transition-colors">✕</button>
                    </div>
                </li>
            </ul>
            <p v-if="!items?.length" class="text-slate-400 text-sm py-10 text-center">등록된 항목이 없습니다.</p>
        </div>

        <div v-if="isActive" class="pt-4 mt-4 border-t-2 border-[#f4e2de] shrink-0 flex gap-2">
            <input v-model="newItemName" type="text" @keyup.enter="handleAdd" class="flex-1 bg-white border-2 border-[#f4e2de] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#ffab91]" placeholder="새 항목 이름" />
            <button @click="handleAdd" class="bg-[#ffab91] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#ff8a65] transition-colors shadow-sm">추가</button>
        </div>
    </div>
</template>
<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}
</style>
