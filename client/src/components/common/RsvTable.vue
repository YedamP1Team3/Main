<script setup>
const props = defineProps({
    columns: {
        type: Array,
        default: () => []
    },
    rows: {
        type: Array,
        default: () => []
    },
    rowKey: {
        type: String,
        default: 'rsv_id'
    },
    emptyMessage: {
        type: String,
        default: '데이터가 없습니다.'
    },
    clickable: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['row-click', 'action-click']);

const formatDate = (dateTime) => {
    if (!dateTime) return '-';

    const date = new Date(dateTime);
    if (Number.isNaN(date.getTime())) return '-';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const formatTime = (dateTime) => {
    if (!dateTime) return '-';

    const date = new Date(dateTime);
    if (Number.isNaN(date.getTime())) return '-';

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
};

const formatTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return '-';
    return `${formatTime(startTime)} ~ ${formatTime(endTime)}`;
};

const formatStatusLabel = (status) => {
    switch (status) {
        case 'REQUESTED':
            return '예약대기';
        case 'APPROVED':
            return '예약승인';
        case 'REJECTED':
            return '예약반려';
        case 'COMPLETED':
            return '상담완료';
        case 'NOTE_WRITTEN':
            return '일지작성완료';
        default:
            return '-';
    }
};

const getStatusClass = (status) => {
    switch (status) {
        case 'REQUESTED':
            return 'requested';
        case 'APPROVED':
            return 'approved';
        case 'REJECTED':
            return 'rejected';
        case 'COMPLETED':
            return 'completed';
        case 'NOTE_WRITTEN':
            return 'note-written';
        default:
            return '';
    }
};

const getCellValue = (row, column) => {
    switch (column.type) {
        case 'date':
            return formatDate(row[column.key]);

        case 'timeRange':
            return formatTimeRange(row[column.key], row[column.endKey]);

        case 'status':
            return formatStatusLabel(row[column.key]);

        case 'text':
        default:
            return row[column.key] ?? '-';
    }
};

const getActionLabel = (column, row) => {
    switch (column.action) {
        case 'cancel':
            return '취소';
        case 'process':
            return '처리';
        case 'writeLog':
            return row.rsv_status === 'NOTE_WRITTEN' ? '수정' : '작성';
        case 'viewRejectReason':
            return '조회';
        default:
            return '버튼';
    }
};

const getActionClass = (column) => {
    switch (column.action) {
        case 'cancel':
            return 'cancel';
        case 'process':
            return 'process';
        case 'writeLog':
            return 'write-log';
        case 'viewRejectReason':
            return 'view-reject-reason';
        default:
            return '';
    }
};

const isActionDisabled = (row, column) => {
    switch (column.action) {
        case 'cancel':
            return !['REQUESTED', 'REJECTED'].includes(row.rsv_status);

        case 'process':
            return row.rsv_status !== 'REQUESTED';

        case 'writeLog':
            return !['COMPLETED', 'NOTE_WRITTEN'].includes(row.rsv_status);

        case 'viewRejectReason':
            return row.rsv_status !== 'REJECTED';
        default:
            return false;
    }
};

const handleRowClick = (row) => {
    if (!props.clickable) return;
    emit('row-click', row);
};

const handleActionClick = (row, column) => {
    if (isActionDisabled(row, column)) return;

    emit('action-click', {
        action: column.action,
        row
    });
};
</script>

<template>
    <table class="list-table">
        <thead>
            <tr>
                <th v-for="column in columns" :key="column.key">
                    {{ column.label }}
                </th>
            </tr>
        </thead>

        <tbody>
            <tr v-if="rows.length === 0">
                <td :colspan="columns.length" class="empty-msg">
                    {{ emptyMessage }}
                </td>
            </tr>

            <tr v-else v-for="row in rows" :key="row[rowKey]" :class="{ 'clickable-row': clickable }" @click="handleRowClick(row)">
                <td v-for="column in columns" :key="`${row[rowKey]}-${column.key}`">
                    <template v-if="column.type === 'status'">
                        <span class="status-badge" :class="getStatusClass(row[column.key])">
                            {{ getCellValue(row, column) }}
                        </span>
                    </template>

                    <template v-else-if="column.type === 'action'">
                        <button type="button" class="action-btn" :class="getActionClass(column)" :disabled="isActionDisabled(row, column)" @click.stop="handleActionClick(row, column)">
                            {{ getActionLabel(column, row) }}
                        </button>
                    </template>

                    <template v-else>
                        {{ getCellValue(row, column) }}
                    </template>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped>
.list-table {
    width: 100%;
    border-collapse: collapse;
    text-align: center;
    font-size: 0.9rem;
}

.list-table th {
    padding: 10px;
    font-weight: 600;
    color: #64748b;
    border-top: 1px solid #cbd5e1;
    border-bottom: 1px solid #cbd5e1;
    background-color: #f8fafc;
}

.list-table td {
    padding: 12px 10px;
    color: #5f4b45;
    border-bottom: 1px solid #f1ddd6;
    vertical-align: middle;
}

.empty-msg {
    padding: 30px !important;
    color: #a8a29e !important;
    text-align: center;
}

.clickable-row {
    cursor: pointer;
    transition: background-color 0.2s;
}

.clickable-row:hover {
    background-color: #fff4ef;
}

.status-badge {
    display: inline-block;
    min-width: 82px;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 700;
    background-color: transparent;
}

.status-badge.requested {
    color: #e07a5f;
}

.status-badge.approved {
    color: #4d8b6b;
}

.status-badge.rejected {
    color: #dc2626;
}

.status-badge.completed {
    color: #7b6a58;
}

.status-badge.note-written {
    color: #8a6fa8;
}

.action-btn {
    min-width: 78px;
    padding: 7px 12px;
    border: none;
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 600;
    color: #ffffff;
    background-color: #ffab91;
    cursor: pointer;
    transition: opacity 0.2s ease;
}

.action-btn:hover:not(:disabled) {
    opacity: 0.9;
}

.action-btn.cancel {
    background-color: #ef4444;
}

.action-btn.process {
    background-color: #ffab91;
}

.action-btn.write-log {
    background-color: #ffab91;
}

.action-btn:disabled {
    background-color: #cac1bc;
    color: #ffffff;
    cursor: not-allowed;
}
.action-btn.view-reject-reason {
    background-color: #ffab91;
    color: #ffffff;
}
</style>
