<script setup>
import ServeyDetailWidget from '@/components/servey/ServeyDetailWidget.vue';
import ServeyItemWidget from '@/components/servey/ServeyItemWidget.vue';
import ServeySubItemWidget from '@/components/servey/ServeySubItemWidget.vue';
</script>

<template>
    <div class="bg-slate-50 pt-[5rem] px-4 pb-4 md:px-6 md:pb-6">
        <div class="grid grid-cols-12 gap-4 md:gap-6 min-h-[calc(100vh-8rem)]">
            <div class="col-span-12 lg:col-span-3">
                <ServeyItemWidget />
            </div>

            <div class="col-span-12 lg:col-span-3">
                <ServeySubItemWidget />
            </div>

            <div class="col-span-12 lg:col-span-6">
                <ServeyDetailWidget />
            </div>
        </div>
    </div>
</template>
