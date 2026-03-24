<script setup>
import { ref } from 'vue';
import AdTabPlan from './AdTabPlan.vue';

const props = defineProps({
    beneId: { type: [String, Number] }
});

const emit = defineEmits(['select-plan']);
const currentTab = ref('Plan');
const tabPlanRef = ref(null);

const handleSelectPlan = (planId) => {
    emit('select-plan', planId);
};

defineExpose({
    refreshTabPlan: () => {
        if (tabPlanRef.value) tabPlanRef.value.fetchPlanList(props.beneId);
    }
});
</script>
<template>
    <div class="management-container">
        <nav class="tab-menu">
            <button :class="{ active: currentTab === 'Application' }" @click="currentTab = 'Application'">지원신청서</button>
            <button :class="{ active: currentTab === 'Plan' }" @click="currentTab = 'Plan'">지원계획서</button>
            <button :class="{ active: currentTab === 'Result' }" @click="currentTab = 'Result'">지원결과서</button>
            <button :class="{ active: currentTab === 'Consult' }" @click="currentTab = 'Consult'">상담내역</button>
        </nav>

        <div class="tab-content">
            <AdTabPlan v-if="currentTab === 'Plan'" ref="tabPlanRef" :beneId="beneId" @select-plan="handleSelectPlan" />
        </div>
    </div>
</template>

<style scoped>
/* 1. 전체를 감싸는 흰색 카드 컨테이너 */
.management-container {
    background-color: #ffffff; /* 🟢 요청하신 흰색 배경 */
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 0; /* 내부에서 여백 조절 */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    overflow: hidden; /* 테두리 밖으로 내용 안 나가게 */
}

/* 2. 탭 메뉴 스타일 */
.tab-menu {
    display: flex;
    background-color: #ffffff;
    border-bottom: 1px solid #f1f5f9;
    padding: 0 10px;
}

.tab-menu button {
    background: none;
    border: none;
    padding: 15px 20px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #94a3b8;
    cursor: pointer;
    position: relative;
    transition: all 0.2s;
}

/* 활성화된 탭 포인트 */
.tab-menu button.active {
    color: #3b82f6;
}

.tab-menu button.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #3b82f6; /* 탭 하단 파란색 선 */
}

/* 3. 하단 컨텐츠 영역 패딩 */
.tab-content {
    padding: 20px;
    min-height: 400px; /* 목록이 없을 때도 일정 높이 유지 */
}
</style>
