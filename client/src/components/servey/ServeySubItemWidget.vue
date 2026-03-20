<script setup>
// [1] 부모가 계산(computed)해서 보내준 subItems와 선택된 ID를 받습니다.
const props = defineProps({
    subItems: Array,
    selectedId: Number
});

// [2] 클릭 시 부모에게 알릴 이벤트를 정의합니다.
const emit = defineEmits(['select']);
</script>

<template>
    <div class="card bg-white shadow-md rounded-xl h-full flex flex-col p-5 mb-0 border border-slate-200">
        <div class="mb-4 shrink-0">
            <h5 class="font-bold text-xl text-slate-800">지원서 세부항목</h5>
        </div>

        <div class="flex-1 overflow-y-auto border-2 border-dashed border-blue-200 p-4 rounded-lg bg-slate-50/50 min-h-[15rem]">
            <ul v-if="subItems && subItems.length > 0" class="space-y-2">
                <li
                    v-for="subItem in subItems"
                    :key="subItem.id"
                    @click="emit('select', subItem.id)"
                    :class="['p-3 rounded-lg cursor-pointer transition-all border', selectedId === subItem.id ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600']"
                >
                    <div class="flex items-center justify-between">
                        <span class="font-medium">{{ subItem.name }}</span>
                        <span v-if="selectedId === subItem.id" class="text-blue-500">●</span>
                    </div>
                </li>
            </ul>

            <div v-else class="flex flex-col items-center justify-center h-full opacity-70">
                <p class="text-slate-500 text-sm mb-2 text-center mt-4">항목을 먼저 선택하거나</p>
                <p class="text-slate-400 text-xs text-center">세부항목을 추가해 주세요.</p>
            </div>
        </div>

        <div class="mt-4 pt-4 border-t border-slate-100 shrink-0">
            <div class="border-2 border-dashed border-red-200 p-4 rounded-lg">
                <h5 class="font-bold text-lg mb-2 text-slate-800">세부항목 추가</h5>
                <div class="flex gap-2">
                    <input type="text" placeholder="세부항목 입력" class="flex-1 bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200" />
                    <button class="bg-red-400 text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-500">추가</button>
                </div>
            </div>
        </div>
    </div>
</template>
