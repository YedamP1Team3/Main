<template>
    <section class="bene-info-card">
        <div class="bene-header">
            <h2>지원대상자 선택</h2>
            <p>보호자가 등록한 지원대상자 중 상담예약할 대상을 선택하세요.</p>
        </div>

        <div class="bene-select-row">
            <label for="bene-select">지원대상자</label>
            <select
                id="bene-select"
                :value="selectedBeneId || ''"
                @change="handleSelect"
            >
                <option value="" disabled>지원대상자를 선택하세요</option>
                <option
                    v-for="bene in beneficiaries"
                    :key="bene.bene_id"
                    :value="bene.bene_id"
                >
                    {{ bene.bene_name }}
                </option>
            </select>
        </div>

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

        <div v-else class="empty-message">
            지원대상자를 선택하면 상세 정보가 표시됩니다.
        </div>
    </section>
</template>

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
    return props.beneficiaries.find(
        (bene) => String(bene.bene_id) === String(props.selectedBeneId)
    ) || null;
});

const handleSelect = (event) => {
    const beneId = event.target.value;

    const selected = props.beneficiaries.find(
        (bene) => String(bene.bene_id) === String(beneId)
    );

    emit('select-beneficiary', selected || null);
};
</script>

<style scoped>
.bene-info-card {
    width: 100%;
    background: #fff;
    border-radius: 16px;
    padding: 24px 28px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
}

.bene-header {
    margin-bottom: 20px;
}

.bene-header h2 {
    margin: 0 0 8px;
    font-size: 24px;
    font-weight: 700;
    color: #222;
}

.bene-header p {
    margin: 0;
    color: #666;
    font-size: 14px;
}

.bene-select-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 24px;
}

.bene-select-row label {
    font-size: 14px;
    font-weight: 600;
    color: #333;
}

.bene-select-row select {
    width: 100%;
    max-width: 420px;
    height: 44px;
    border: 1px solid #dcdfe6;
    border-radius: 10px;
    padding: 0 14px;
    font-size: 14px;
    background: #fff;
    outline: none;
}

.bene-select-row select:focus {
    border-color: #4f46e5;
}

.bene-detail-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(180px, 1fr));
    gap: 16px;
}

.detail-item {
    background: #f8f9fc;
    border-radius: 12px;
    padding: 16px;
    min-height: 86px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.label {
    font-size: 13px;
    color: #777;
    margin-bottom: 8px;
}

.value {
    font-size: 16px;
    font-weight: 600;
    color: #222;
    word-break: break-word;
}

.empty-message {
    padding: 18px;
    border-radius: 12px;
    background: #f8f9fc;
    color: #777;
    font-size: 14px;
}

@media (max-width: 1100px) {
    .bene-detail-grid {
        grid-template-columns: repeat(2, minmax(180px, 1fr));
    }
}

@media (max-width: 700px) {
    .bene-detail-grid {
        grid-template-columns: 1fr;
    }

    .bene-select-row select {
        max-width: 100%;
    }
}
</style>