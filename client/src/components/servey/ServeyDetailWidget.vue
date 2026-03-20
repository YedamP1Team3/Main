<script setup>
// [1] 부모로부터 해당 세부항목에 속한 질문 리스트를 받습니다.
const props = defineProps({
    details: Array
});

// [2] 전체 저장 등 부모에게 보낼 이벤트를 정의합니다.
const emit = defineEmits(['save-all']);
</script>

<template>
    <div class="card bg-white shadow-md rounded-xl h-full flex flex-col p-5 mb-0 border border-slate-200">
        <div class="flex items-center gap-3 mb-4 text-sm text-slate-500 shrink-0">
            <button class="cursor-pointer hover:text-blue-600 transition-colors font-medium">전체 선택</button>
            <span class="text-slate-300">|</span>
            <button class="cursor-pointer hover:text-red-600 transition-colors font-medium">선택 삭제</button>
        </div>

        <div class="flex-1 overflow-y-auto border-2 border-dashed border-emerald-200 p-4 rounded-lg bg-slate-50/50 relative min-h-[25rem]">
            <ul v-if="details && details.length > 0" class="space-y-3">
                <li v-for="(detail, index) in details" :key="detail.id" class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start gap-3">
                    <input type="checkbox" class="mt-1" />
                    <div class="flex-1">
                        <p class="text-xs text-slate-400 mb-1 font-mono">Question {{ index + 1 }}</p>
                        <p class="text-slate-700 font-medium">{{ detail.title }}</p>
                    </div>
                </li>
            </ul>

            <div v-else class="flex flex-col items-center justify-center h-full opacity-70">
                <p class="text-slate-500 text-sm mb-2 text-center">세부항목을 선택하면</p>
                <p class="text-slate-400 text-xs text-center">등록된 질문 리스트가 표시됩니다.</p>
            </div>

            <div class="absolute bottom-4 right-4">
                <button class="py-2 px-5 border-2 border-dashed border-violet-400 bg-white rounded-lg shadow-sm text-violet-600 font-bold text-sm cursor-pointer hover:bg-violet-50 transition-colors">+ 질문 추가</button>
            </div>
        </div>

        <div class="mt-5 pt-4 border-t border-slate-100 flex justify-end">
            <button @click="emit('save-all')" class="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg active:scale-95">전체 저장 (Version Update)</button>
        </div>
    </div>
</template>
