<script setup>
// 입력값을 담을 공간 생성
import { ref } from 'vue';

const props = defineProps({
    items: Array,
    selectedId: Number
});

const newItemName = ref('');

const emit = defineEmits(['select', 'item']);

// view에 값 보내기
const handleAdd = () => {
    if (!newItemName.value.trim()) return; // 빈 값 체크

    // 부모에게 'add-item'이라는 이름으로 입력값을 실어 보냄
    emit('add-item', newItemName.value);

    //  확인용으로 자식에서도 찍어볼 수 있음
    // console.log('자식에서 보냄:', newItemName.value);

    // 보낸 후 입력창 초기화
    newItemName.value = '';
};
</script>

<template>
    <div class="flex flex-col h-[40rem] bg-white shadow-md rounded-xl border border-slate-200 p-5">
        <div class="pb-4 shrink-0">
            <h5 class="font-bold text-xl text-slate-800">지원서 항목</h5>
        </div>

        <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <ul class="space-y-2">
                <li
                    v-for="item in items"
                    :key="item.id"
                    @click="emit('select', item.id)"
                    :class="[
                        'p-3 rounded-lg cursor-pointer transition-all border font-medium flex items-center justify-between',
                        selectedId === item.id ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm' : 'bg-slate-50 border-transparent hover:bg-slate-100 text-slate-600'
                    ]"
                >
                    <span>{{ item.name }}</span>
                    <span v-if="selectedId === item.id" class="text-blue-500 text-xs">●</span>
                </li>
            </ul>

            <p v-if="!items?.length" class="text-slate-400 text-sm py-10 text-center">등록된 항목이 없습니다.</p>
        </div>

        <div class="pt-4 mt-4 border-t border-slate-100 shrink-0">
            <div class="flex gap-2">
                <input v-model="newItemName" type="text" @keyup.enter="handleAdd" class="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none" placeholder="새 항목 이름" />
                <button @click="handleAdd" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">추가</button>
            </div>
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
