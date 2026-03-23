    <script setup>
    import { ref,watch } from 'vue';

    // 우리가 만든 컴포넌트들을 가져옵니다.
    import BeneficiaryInfo from './BeneficiaryInfo.vue';
    import BeneficiaryManagement from './BeneficiaryManagement.vue';
    import BeneficiaryNewPlan from './BeneficiaryNewPlan.vue';
    
    const selectedId = ref('');
    const selectedPriorityId = ref(null);
    const viewMode = ref('empty');
    const managementRef = ref(null);//새로고침
    


    //지원자를 새로 선택했을때
    const handleIdUpdate = (id,priorityId) => {
      selectedId.value = id;
      selectedPriorityId.value = priorityId;
      viewMode.value='empty'; //대상자가 바뀌면 입력창 닫음
      console.log("메인 페이지에서 받은 ID:", id);
    };

    // 저장후 새로고침 하는 함수
    const reloadList = () => {
      if (managementRef.value) {
        managementRef.value.refreshTabPlan();
      }
        viewMode.value = 'empty';
      };

watch(viewMode, (newVal) => {
  console.log("부모의 viewMode가 변경됨:", newVal);
});//

    </script>
<template>
  <div class="dashboard-container">
    <aside class="side-panel">
      <section class="info-section">
        <BeneficiaryInfo @updateBeneId="handleIdUpdate" />
      </section>

      <section class="list-section">
        <BeneficiaryManagement 
          ref="managementRef"
          :beneId="selectedId" 
          @newaddplan="viewMode = 'create'" 
        />
      </section>
    </aside>

    <main class="main-content">
      <div v-if="viewMode === 'create'" class="editor-container">
        <BeneficiaryNewPlan 
          :beneId="selectedId" 
          :priorityId="selectedPriorityId"
          @cancel="viewMode = 'empty'"
          @refresh="reloadList"
        />
      </div>
    </main>
  </div>

  

</template>

<style scoped>
/* 전체 화면 컨테이너 */
.dashboard-container {
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: #ffffff; /* 전체는 흰색 바탕 */
  overflow: hidden;
}

/* 🟢 왼쪽 사이드 패널 (500px) */
.side-panel {
  flex: 0 0 600px;
  background-color: #f8fafc; /* 살짝 회색빛을 주어 영역 분리 */
  border-right: 1px solid #e2e8f0; /* 중간 세로 구분선 */
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
  overflow-y: auto; /* 내용 많을 때 스크롤 */
}

/* 각 섹션(정보, 목록) 스타일 */
.info-section, .list-section {
  width: 100%;
}

/* 🔵 오른쪽 메인 콘텐츠 영역 */
.main-content {
  flex: 1;
  background-color: #ffffff;
  padding: 40px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* 작성창 컨테이너 */
.editor-container {
  width: 100%;
  max-width: 900px; /* 너무 넓어지지 않게 가이드라인 설정 */
  margin: 0 auto;   /* 중앙 정렬 */
}

/* 빈 화면 가이드 스타일 */
.empty-state {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #94a3b8;
}

.guide-box {
  text-align: center;
  border: 2px dashed #e2e8f0;
  padding: 50px;
  border-radius: 16px;
}

.guide-box i {
  font-size: 2rem;
  margin-bottom: 1rem;
}
</style>