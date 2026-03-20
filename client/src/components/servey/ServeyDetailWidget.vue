<script setup></script>

<template>
    <div class="card bg-white shadow-md rounded-xl h-full flex flex-col p-5 mb-0 border border-slate-200">
        <div class="flex items-center gap-3 mb-4 text-sm text-slate-500 shrink-0">
            <button class="cursor-pointer hover:text-blue-600 transition-colors bg-transparent border-none p-0 font-medium">전체 선택</button>
            <span class="text-slate-300">|</span>
            <button class="cursor-pointer hover:text-red-600 transition-colors bg-transparent border-none p-0 font-medium">선택 삭제</button>
        </div>

        <div class="flex-1 overflow-y-auto border-2 border-dashed border-emerald-200 p-4 rounded-lg bg-slate-50/50 relative min-h-[25rem]">
            <div class="flex flex-col items-center justify-center h-full opacity-70">
                <p class="text-slate-500 text-sm mb-2">[5, 6번 영역]</p>
                <p class="text-slate-400 text-xs">질문 리스트 및 입력 필드 영역</p>
            </div>

            <div class="absolute bottom-4 right-4">
                <button class="py-2 px-5 border-2 border-dashed border-violet-400 bg-white rounded-lg shadow-sm text-violet-600 font-bold text-sm cursor-pointer hover:bg-violet-50 transition-colors">+ [7번] 질문 추가</button>
            </div>
        </div>

        <div class="mt-5 flex justify-end shrink-0">
            <button class="py-3 px-8 border-2 border-transparent bg-orange-500 text-white rounded-lg font-bold shadow-md cursor-pointer hover:bg-orange-600 transition-colors">[8번] 전체 저장하기</button>
        </div>
    </div>
</template>
