<script setup>
import { computed } from 'vue';

const props = defineProps({
    beneficiaries: {
        type: Array,
        default: () => []
    },
    selectedBeneId: {
        type: [Number, String, null],
        default: null
    }
});

const emit = defineEmits(['select-beneficiary']);

const selectedBeneficiary = computed(() => {
    return props.beneficiaries.find((bene) => String(bene.bene_id) === String(props.selectedBeneId)) || null;
});

const handleSelect = (event) => {
    const beneId = event.target.value;

    const selected = props.beneficiaries.find((bene) => String(bene.bene_id) === String(beneId));

    emit('select-beneficiary', selected || null);
};
</script>

<template>
    <section class="bene-info-card">
        <div class="bene-header">
            <h2>지원대상자 선택</h2>
            <p>보호자가 등록한 지원대상자 중 상담예약할 대상을 선택하세요.</p>
        </div>

        <div class="bene-content-row">
            <div class="bene-select-row">
                <label for="bene-select">지원대상자</label>
                <select id="bene-select" :value="selectedBeneId || ''" @change="handleSelect">
                    <option value="" disabled>지원대상자를 선택하세요</option>
                    <option v-for="bene in beneficiaries" :key="bene.bene_id" :value="bene.bene_id">
                        {{ bene.bene_name }}
                    </option>
                </select>
            </div>

            <div class="bene-detail-wrapper">
                <div v-if="selectedBeneficiary" class="bene-detail-grid">
                    <div class="detail-item">
                        <span class="label">이름</span>
                        <span class="value">{{ selectedBeneficiary.bene_name }}</span>
                    </div>

                    <div class="detail-item">
                        <span class="label">담당자 ID</span>
                        <span class="value">{{ selectedBeneficiary.manager_id || '-' }}</span>
                    </div>

                    <div class="detail-item">
                        <span class="label">관계</span>
                        <span class="value">{{ selectedBeneficiary.relationship || '-' }}</span>
                    </div>

                    <div class="detail-item">
                        <span class="label">장애 유형</span>
                        <span class="value">{{ selectedBeneficiary.disability_type || '-' }}</span>
                    </div>
                </div>

                <div v-else class="empty-message">지원대상자를 선택하면 상세 정보가 표시됩니다.</div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.bene-info-card {
    width: 100%;
    max-width: 320px;
    min-width: 260px;
    background: #ffffff;
    border-right: 1px solid #f4e2de;
    padding: 24px 20px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.bene-header {
    margin-bottom: 0;
}

.bene-header h2 {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 700;
    color: #222;
    line-height: 1.3;
}

.bene-header p {
    margin: 0;
    color: #666;
    font-size: 13px;
    line-height: 1.5;
    word-break: keep-all;
}

.bene-select-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 0;
}

.bene-select-row label {
    font-size: 14px;
    font-weight: 600;
    color: #333;
}

.bene-select-row select {
    width: 100%;
    height: 44px;
    border: 1px solid #dcdfe6;
    border-radius: 10px;
    padding: 0 14px;
    font-size: 14px;
    background: #fff;
    outline: none;
    box-sizing: border-box;
}

.bene-select-row select:focus {
    border-color: #4f46e5;
}

.bene-detail-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.detail-item {
    background: #f8f9fc;
    border-radius: 12px;
    padding: 14px 16px;
    min-height: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border: 1px solid #eef1f6;
}

.label {
    font-size: 12px;
    color: #777;
    margin-bottom: 6px;
}

.value {
    font-size: 15px;
    font-weight: 600;
    color: #222;
    word-break: break-word;
    line-height: 1.4;
}

.empty-message {
    padding: 16px;
    border-radius: 12px;
    background: #f8f9fc;
    color: #777;
    font-size: 14px;
    line-height: 1.5;
    border: 1px solid #eef1f6;
}

@media (max-width: 900px) {
    .bene-info-card {
        max-width: 100%;
        min-width: 100%;
    }
}
</style>
