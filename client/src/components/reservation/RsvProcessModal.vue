<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    reservation: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['close', 'confirm']);

const decision = ref('');
const rejectReason = ref('');

watch(
    () => props.visible,
    (newValue) => {
        if (newValue) {
            decision.value = '';
            rejectReason.value = '';
        }
    }
);

const isConfirmDisabled = computed(() => {
    if (!decision.value) return true;
    if (decision.value === 'REJECTED' && !rejectReason.value.trim()) return true;
    return false;
});

const handleClose = () => {
    emit('close');
};

const handleConfirm = () => {
    if (isConfirmDisabled.value) return;

    emit('confirm', {
        rsvId: props.reservation?.rsv_id,
        decision: decision.value,
        rejectReason: rejectReason.value.trim()
    });
};
</script>

<template>
    <div v-if="visible" class="modal-overlay" @click="handleClose">
        <div class="modal-container" @click.stop>
            <div class="modal-header">
                <h3 class="modal-title">예약 처리</h3>
                <button type="button" class="close-btn" @click="handleClose">✕</button>
            </div>

            <div class="modal-body">
                <div class="info-box">
                    <p><strong>보호자명</strong> : {{ reservation?.family_name }}</p>
                    <p><strong>지원대상자명</strong> : {{ reservation?.bene_name }}</p>
                    <p><strong>예약날짜</strong> : {{ reservation?.reservation_date }}</p>
                    <p><strong>예약시간</strong> : {{ reservation?.reservation_time }}</p>
                </div>

                <div class="decision-section">
                    <p class="section-label">처리 방식을 선택하세요.</p>

                    <label class="radio-item">
                        <input v-model="decision" type="radio" value="APPROVED" />
                        승인
                    </label>

                    <label class="radio-item">
                        <input v-model="decision" type="radio" value="REJECTED" />
                        반려
                    </label>
                </div>

                <div v-if="decision === 'REJECTED'" class="reject-section">
                    <label for="rejectReason" class="section-label">반려사유</label>
                    <textarea id="rejectReason" v-model="rejectReason" class="reject-textarea" placeholder="반려 사유를 입력하세요." rows="4" />
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="cancel-btn" @click="handleClose">취소</button>
                <button type="button" class="confirm-btn" :disabled="isConfirmDisabled" @click="handleConfirm">확인</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.45);
    z-index: 9999;
}

.modal-container {
    width: 100%;
    max-width: 520px;
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 20px;
    border-bottom: 1px solid #e5e7eb;
}

.modal-title {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
}

.close-btn {
    border: none;
    background: transparent;
    font-size: 18px;
    cursor: pointer;
}

.modal-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.info-box {
    padding: 16px;
    border-radius: 10px;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
}

.info-box p {
    margin: 0 0 8px 0;
}

.info-box p:last-child {
    margin-bottom: 0;
}

.section-label {
    display: block;
    margin-bottom: 10px;
    font-weight: 600;
}

.decision-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.radio-item {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.reject-section {
    display: flex;
    flex-direction: column;
}

.reject-textarea {
    width: 100%;
    resize: none;
    padding: 12px;
    border: 1px solid #ced4da;
    border-radius: 8px;
    font-size: 14px;
    box-sizing: border-box;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 20px;
    border-top: 1px solid #e5e7eb;
}

.cancel-btn,
.confirm-btn {
    min-width: 88px;
    height: 40px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
}

.cancel-btn {
    background-color: #e9ecef;
}

.confirm-btn {
    background-color: #ffab91;
    color: white;
}

.confirm-btn:disabled {
    background-color: #cbd5e1;
    cursor: not-allowed;
}
</style>
