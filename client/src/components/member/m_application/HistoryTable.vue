<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { PRIORITY_MAP, useSurveyStore } from '@/stores/useSurveyStore';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
    filters: {
        type: Object,
        default: () => ({
            startDate: '',
            endDate: '',
            beneName: '',
            managerName: '',
            status: 'all',
            progress: 'all'
        })
    }
});

const router = useRouter();
const authStore = useAuthStore();
const surveyStore = useSurveyStore();

const historyRows = ref([]);
const isLoading = ref(false);

const normalizePriorityLabel = (priorityData) => {
    const progressStatus = String(priorityData?.progress_status || '').toLowerCase();
    const priorityStatus = String(priorityData?.priority_status || '').toLowerCase();

    if (progressStatus === 'pending') return '대기';
    if (progressStatus === 'rejected') return '반려';
    if (progressStatus === 'approved') return PRIORITY_MAP[priorityStatus] || '승인';
    if (!priorityStatus || priorityStatus === 'none') return '-';

    return PRIORITY_MAP[priorityStatus] || priorityStatus;
};

const resolveStatusCode = (priorityData) => {
    const progressStatus = String(priorityData?.progress_status || '').toLowerCase();

    if (progressStatus === 'pending' || progressStatus === 'approved' || progressStatus === 'rejected') {
        return progressStatus;
    }

    return 'all';
};

const resolveProgressLabel = ({ applications, plans, results }) => {
    if (results.length > 0) return '결과서 등록';
    if (plans.length > 0) return '계획서 등록';
    if (applications.length > 0) return applications[0].app_status || '신청 접수';
    return '-';
};

const resolveProgressCode = ({ applications, plans, results }) => {
    if (results.length > 0) return 'result';
    if (plans.length > 0) return 'plan';
    if (applications.length > 0) return 'application';
    return 'none';
};

const normalizeDateForCompare = (value) => {
    if (!value || value === '-') {
        return null;
    }

    return String(value).replace(/\./g, '-');
};

const filteredRows = computed(() => {
    const beneName = props.filters?.beneName?.trim().toLowerCase() || '';
    const managerName = props.filters?.managerName?.trim().toLowerCase() || '';
    const startDate = props.filters?.startDate || '';
    const endDate = props.filters?.endDate || '';
    const status = props.filters?.status || 'all';
    const progress = props.filters?.progress || 'all';

    return historyRows.value.filter((item) => {
        const rowDate = normalizeDateForCompare(item.startDate);
        const matchedBeneName = !beneName || item.name.toLowerCase().includes(beneName);
        const matchedManagerName =
            !managerName ||
            String(item.manager || '')
                .toLowerCase()
                .includes(managerName);
        const matchedStatus = status === 'all' || item.statusCode === status;
        const matchedProgress = progress === 'all' || item.progressCode === progress;
        const matchedStartDate = !startDate || (rowDate && rowDate >= startDate);
        const matchedEndDate = !endDate || (rowDate && rowDate <= endDate);

        return matchedBeneName && matchedManagerName && matchedStatus && matchedProgress && matchedStartDate && matchedEndDate;
    });
});

const fetchHistoryRows = async () => {
    if (!authStore.userId) {
        historyRows.value = [];
        return;
    }

    isLoading.value = true;

    try {
        await surveyStore.fetchBeneficiaryList();

        const beneficiaries = surveyStore.my_beneficiaries || [];

        const rows = await Promise.all(
            beneficiaries.map(async (beneficiary, index) => {
                const beneId = beneficiary.bene_id;

                const [detailRes, priorityRes, applicationRes, planRes, resultRes] = await Promise.all([
                    axios.get(`/api/abc/bene/${beneId}`),
                    axios.get(`/api/abc/priority/${beneId}`),
                    axios.get(`/api/survey/list/${beneId}`),
                    axios.get(`/api/api/beneficiaries/${beneId}/support-plan`),
                    axios.get(`/api/resultPlan/beneficiaries/${beneId}/support-result`)
                ]);

                const detail = detailRes.data || {};
                const priorityData = priorityRes.data?.success ? priorityRes.data.data : null;
                const applications = applicationRes.data?.success ? applicationRes.data.data || [] : [];
                const plans = Array.isArray(planRes.data) ? planRes.data : [];
                const results = Array.isArray(resultRes.data) ? resultRes.data : [];

                return {
                    no: index + 1,
                    beneId,
                    name: beneficiary.bene_name,
                    startDate: applications[0]?.date || '-',
                    manager: detail.manager_name || '-',
                    priority: normalizePriorityLabel(priorityData),
                    statusCode: resolveStatusCode(priorityData),
                    progress: resolveProgressLabel({ applications, plans, results }),
                    progressCode: resolveProgressCode({ applications, plans, results }),
                    hasApplication: applications.length > 0,
                    hasPlan: plans.length > 0,
                    hasResult: results.length > 0
                };
            })
        );

        historyRows.value = rows;
    } catch (error) {
        console.error('이력 데이터를 불러오지 못했습니다.', error);
        historyRows.value = [];
    } finally {
        isLoading.value = false;
    }
};

const goToManagementView = async (beneId, tab) => {
    await surveyStore.fetchBeneficiaryList();
    await surveyStore.selectBeneficiary(beneId);

    await router.push({
        name: 'mApplication',
        query: {
            beneId: String(beneId),
            tab
        }
    });
};

onMounted(fetchHistoryRows);
</script>

<template>
    <div class="main-content">
        <h2>지원 신청 이력</h2>

        <div v-if="isLoading" class="table-state">이력 데이터를 불러오는 중입니다.</div>
        <div v-else-if="filteredRows.length === 0" class="table-state">조건에 맞는 지원 이력이 없습니다.</div>
        <table v-else class="history-table">
            <thead>
                <tr>
                    <th>번호</th>
                    <th>지원대상자명</th>
                    <th>지원신청일</th>
                    <th>지원신청서</th>
                    <th>담당자</th>
                    <th>대기단계</th>
                    <th>계획/결과 진행</th>
                    <th>지원계획</th>
                    <th>지원결과</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in filteredRows" :key="item.beneId">
                    <td>{{ item.no }}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.startDate }}</td>
                    <td>
                        <button type="button" class="btn-view" :disabled="!item.hasApplication" @click="goToManagementView(item.beneId, 'Application')">보기</button>
                    </td>
                    <td>{{ item.manager }}</td>
                    <td>{{ item.priority }}</td>
                    <td>{{ item.progress }}</td>
                    <td>
                        <button type="button" class="btn-view-outline" :disabled="!item.hasPlan" @click="goToManagementView(item.beneId, 'Plan')">보기</button>
                    </td>
                    <td>
                        <button type="button" class="btn-view-outline" :disabled="!item.hasResult" @click="goToManagementView(item.beneId, 'Result')">보기</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.main-content {
    flex: 1;
    background-color: white;
    padding: 30px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

h2 {
    font-size: 1.25rem;
    color: #1e293b;
    margin-bottom: 20px;
}

.table-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 240px;
    color: #64748b;
    font-size: 0.95rem;
    border: 1px dashed #cbd5e1;
    border-radius: 8px;
    background-color: #f8fafc;
}

.history-table {
    width: 100%;
    border-collapse: collapse;
    text-align: center;
    font-size: 0.9rem;
}

.history-table th {
    padding: 12px;
    font-weight: 600;
    color: #64748b;
    border-top: 2px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
    background-color: #f8fafc;
}

.history-table td {
    padding: 12px;
    color: #334155;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
}

.history-table tbody tr:hover td {
    background-color: #f8fafc;
}

.btn-view,
.btn-view-outline {
    min-width: 64px;
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
}

.btn-view {
    background-color: #3b82f6;
    color: white;
    border: none;
}

.btn-view-outline {
    background-color: white;
    color: #3b82f6;
    border: 1px solid #3b82f6;
}

.btn-view:disabled,
.btn-view-outline:disabled {
    opacity: 0.35;
    cursor: not-allowed;
}
</style>
