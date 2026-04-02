<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
    mode: {
        type: String,
        default: 'create'
    },
    reservationInfo: {
        type: Object,
        default: () => ({
            family_name: '',
            bene_name: '',
            disability_type: '',
            reservation_date: '',
            reservation_time: '',
            rsv_status: ''
        })
    },
    initialForm: {
        type: Object,
        default: () => ({
            counselingType: '',
            title: '',
            content: '',
            futurePlan: ''
        })
    }
});

const emit = defineEmits(['submit', 'cancel']);

const form = reactive({
    counselingType: '',
    title: '',
    content: '',
    futurePlan: ''
});

watch(
    () => props.initialForm,
    (newValue) => {
        form.counselingType = newValue?.counselingType || '';
        form.title = newValue?.title || '';
        form.content = newValue?.content || '';
        form.futurePlan = newValue?.futurePlan || '';
    },
    { immediate: true, deep: true }
);

const formatStatusLabel = (status) => {
    switch (status) {
        case 'COMPLETED':
            return '상담완료';
        case 'NOTE_WRITTEN':
            return '일지작성완료';
        default:
            return status || '-';
    }
};

const handleSubmit = () => {
    if (!form.counselingType) {
        alert('상담유형을 선택해주세요.');
        return;
    }

    if (!form.title.trim()) {
        alert('상담제목을 입력해주세요.');
        return;
    }

    if (!form.content.trim()) {
        alert('상세내용을 입력해주세요.');
        return;
    }

    if (!form.futurePlan.trim()) {
        alert('성과 및 향후계획을 입력해주세요.');
        return;
    }

    emit('submit', {
        counselingType: form.counselingType,
        title: form.title.trim(),
        content: form.content.trim(),
        futurePlan: form.futurePlan.trim()
    });
};

const handleCancel = () => {
    emit('cancel');
};
</script>

<template>
    <div class="counseling-note-container">
        <h2 class="page-title">
            {{ mode === 'edit' ? '상담일지 수정' : '상담일지 작성' }}
        </h2>

        <section class="info-section">
            <h3 class="section-title">상담 정보</h3>

            <div class="info-grid">
                <div class="info-item">
                    <label class="info-label">보호자명</label>
                    <div class="info-value">{{ reservationInfo.family_name || '-' }}</div>
                </div>

                <div class="info-item">
                    <label class="info-label">지원대상자명</label>
                    <div class="info-value">{{ reservationInfo.bene_name || '-' }}</div>
                </div>

                <div class="info-item">
                    <label class="info-label">장애유형</label>
                    <div class="info-value">{{ reservationInfo.disability_type || '-' }}</div>
                </div>

                <div class="info-item">
                    <label class="info-label">예약날짜</label>
                    <div class="info-value">{{ reservationInfo.reservation_date || '-' }}</div>
                </div>

                <div class="info-item">
                    <label class="info-label">예약시간</label>
                    <div class="info-value">{{ reservationInfo.reservation_time || '-' }}</div>
                </div>

                <div class="info-item">
                    <label class="info-label">예약상태</label>
                    <div class="info-value">{{ formatStatusLabel(reservationInfo.rsv_status) }}</div>
                </div>
            </div>
        </section>

        <section class="form-section">
            <h3 class="section-title">상담일지 입력</h3>

            <div class="form-group">
                <label for="counselingType" class="form-label">상담유형</label>
                <select id="counselingType" v-model="form.counselingType" class="form-control">
                    <option value="">선택하세요</option>
                    <option value="PHONE">전화상담</option>
                    <option value="VISIT">방문상담</option>
                </select>
            </div>

            <div class="form-group">
                <label for="title" class="form-label">상담제목</label>
                <input id="title" v-model="form.title" type="text" class="form-control" placeholder="상담 제목을 입력하세요" maxlength="100" />
            </div>

            <div class="form-group">
                <label for="content" class="form-label">상세내용</label>
                <textarea id="content" v-model="form.content" class="form-control textarea" rows="7" placeholder="상담 상세내용을 입력하세요" />
            </div>

            <div class="form-group">
                <label for="futurePlan" class="form-label">성과 및 향후계획</label>
                <textarea id="futurePlan" v-model="form.futurePlan" class="form-control textarea" rows="6" placeholder="성과 및 향후계획을 입력하세요" />
            </div>
        </section>

        <div class="button-group">
            <button type="button" class="btn cancel-btn" @click="handleCancel">취소</button>
            <button type="button" class="btn submit-btn" @click="handleSubmit">
                {{ mode === 'edit' ? '수정하기' : '작성완료' }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.counseling-note-container {
    background: #ffffff;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.page-title {
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 28px;
    color: #222;
}

.section-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #333;
}

.info-section,
.form-section {
    margin-bottom: 28px;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(240px, 1fr));
    gap: 16px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.info-label,
.form-label {
    font-size: 14px;
    font-weight: 600;
    color: #555;
}

.info-value {
    min-height: 44px;
    display: flex;
    align-items: center;
    padding: 10px 14px;
    border: 1px solid #dcdfe6;
    border-radius: 10px;
    background-color: #f8f9fb;
    color: #222;
    font-size: 14px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
}

.form-control {
    width: 100%;
    min-height: 44px;
    padding: 10px 14px;
    border: 1px solid #dcdfe6;
    border-radius: 10px;
    font-size: 14px;
    color: #222;
    background-color: #fff;
    box-sizing: border-box;
}

.form-control:focus {
    outline: none;
    border-color: #4a90e2;
}

.textarea {
    resize: vertical;
    min-height: 140px;
    line-height: 1.5;
}

.button-group {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 8px;
}

.btn {
    min-width: 110px;
    height: 44px;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}

.cancel-btn {
    background-color: #e5e7eb;
    color: #333;
}

.cancel-btn:hover {
    background-color: #d1d5db;
}

.submit-btn {
    background-color: #2563eb;
    color: #fff;
}

.submit-btn:hover {
    background-color: #1d4ed8;
}

@media (max-width: 768px) {
    .counseling-note-container {
        padding: 20px;
    }

    .info-grid {
        grid-template-columns: 1fr;
    }

    .button-group {
        flex-direction: column;
    }

    .btn {
        width: 100%;
    }
}
</style>
