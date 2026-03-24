<script setup>
import { ref } from 'vue';
const newSubItemName = ref('');
const props = defineProps({
    subItems: Array,
    selectedId: Number
});

const emit = defineEmits(['select', 'add-sub-item']); // 1. 이름을 정확히 선언

const handleAddSub = () => {
    if (!newSubItemName.value.trim()) return;

    // 2. 부모가 기다리는 'add-sub-item'으로 전달 (이전 코드에서 add-detail로 잘못 적힘)
    emit('add-sub-item', newSubItemName.value);

    newSubItemName.value = '';
};
</script>
<template>
    <div class="flex flex-col h-[40rem] bg-white shadow-md rounded-xl border border-slate-200 p-5">
        <div class="pb-4 shrink-0">
            <h5 class="font-bold text-xl text-slate-800 tracking-tight">지원서 세부항목</h5>
        </div>

        <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <ul v-if="subItems && subItems.length > 0" class="space-y-2">
                <li
                    v-for="subItem in subItems"
                    :key="subItem.id"
                    @click="emit('select', subItem.id)"
                    :class="[
                        'p-3 rounded-lg cursor-pointer transition-all border font-medium flex items-center justify-between',
                        selectedId === subItem.id ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm' : 'bg-slate-50 border-transparent hover:bg-slate-100 text-slate-600'
                    ]"
                >
                    <span>{{ subItem.name }}</span>
                    <span v-if="selectedId === subItem.id" class="text-emerald-500 text-xs">●</span>
                </li>
            </ul>
            <div v-else class="flex flex-col items-center justify-center h-full opacity-70">
                <p class="text-slate-400 text-sm py-10 text-center leading-relaxed">상위 항목을 먼저 선택하거나<br />세부항목을 추가해 주세요.</p>
            </div>
        </div>

        <div class="pt-4 mt-4 border-t border-slate-100 shrink-0">
            <div class="flex gap-2">
                <input
                    v-model="newSubItemName"
                    type="text"
                    @keyup.enter="handleAddSub"
                    class="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    placeholder="새 세부항목 이름"
                />
                <button @click="handleAddSub" class="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 active:scale-95 transition-all shadow-sm">추가</button>
            </div>
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
