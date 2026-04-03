<template>
    <div v-if="visible" class="modal-overlay" @click="handleClose">
        <div class="modal-container" @click.stop>
            <div class="modal-header">
                <h3 class="modal-title">반려사유 조회</h3>
                <button type="button" class="close-btn" @click="handleClose">✕</button>
            </div>

            <div class="modal-body">
                <div class="info-box">
                    <p><strong>보호자명</strong> : {{ reservation?.family_name || '-' }}</p>
                    <p><strong>지원대상자명</strong> : {{ reservation?.bene_name || '-' }}</p>
                    <p><strong>예약날짜</strong> : {{ reservation?.reservation_date || '-' }}</p>
                    <p><strong>예약시간</strong> : {{ reservation?.reservation_time || '-' }}</p>
                    <p><strong>예약상태</strong> : {{ reservation?.rsv_status || '-' }}</p>
                </div>

                <div class="reason-section">
                    <label class="section-label">반려사유</label>
                    <div class="reason-box">
                        {{ reservation?.reject_reason || '등록된 반려사유가 없습니다.' }}
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="confirm-btn" @click="handleClose">닫기</button>
            </div>
        </div>
    </div>
</template>

<script setup>
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

const emit = defineEmits(['close']);

const handleClose = () => {
    emit('close');
};
</script>

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

.reason-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.section-label {
    display: block;
    font-weight: 600;
}

.reason-box {
    min-height: 120px;
    padding: 12px;
    border: 1px solid #ced4da;
    border-radius: 8px;
    background-color: #f8f9fa;
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
    box-sizing: border-box;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 20px;
    border-top: 1px solid #e5e7eb;
}

.confirm-btn {
    min-width: 88px;
    height: 40px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    background-color: #ffab91;
    color: white;
}
</style>
