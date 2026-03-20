<script setup>
// 부모가 보낸 'items'와 'selectedId'를 받겠다고 선언합니다.
const props = defineProps({
    items: Array,
    selectedId: Number
});

// 클릭했을 때 부모에게 알릴 신호 이름을 정합니다.
const emit = defineEmits(['select']);
</script>

<template>
    <div class="card bg-white shadow-md rounded-xl h-full flex flex-col p-5 mb-0 border border-slate-200">
        <div class="flex-1 border-2 border-dashed border-blue-200 p-4 mb-4 rounded-lg overflow-y-auto">
            <h5 class="font-bold text-xl mb-3 text-slate-800">지원서 항목</h5>

            <ul class="space-y-2">
                <li
                    v-for="item in items"
                    :key="item.id"
                    @click="emit('select', item.id)"
                    :class="['p-3 rounded-lg cursor-pointer transition-all border', selectedId === item.id ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-slate-50 border-transparent hover:bg-slate-100']"
                >
                    {{ item.name }}
                </li>
            </ul>

            <p v-if="!items || items.length === 0" class="text-slate-500 text-sm">등록한 섹션이 없습니다. 항목을 추가해 주세요.</p>
        </div>

        <div class="border-2 border-dashed border-red-200 p-4 rounded-lg shrink-0">
            <h5 class="font-bold text-lg mb-2 text-slate-800">항목 추가</h5>
            <div class="flex gap-2">
                <input type="text" class="flex-1 border rounded px-2 py-1 text-sm" placeholder="항목명" />
                <button class="bg-red-400 text-white px-3 py-1 rounded text-sm">추가</button>
            </div>
        </div>
    </div>
</template>
