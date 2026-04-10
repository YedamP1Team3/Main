import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const createPriorityState = () => ({
    progress_status: 'none',
    priority_status: '',
    rejection_reason: '',
    approval_date: null
});

// 화면에서는 한글 이름이 필요하고, 서버에는 영문 코드가 필요하다.
// store에서 두 표현을 같이 관리하면 컴포넌트가 매번 변환 로직을 반복하지 않아도 된다.
export const PRIORITY_MAP = {
    urgent: '긴급',
    high: '중점',
    planned: '계획',
    긴급: 'urgent',
    중점: 'high',
    계획: 'planned'
};

const getPriorityLabel = (value) => {
    const normalized = String(value || '').toLowerCase();
    return PRIORITY_MAP[normalized] || '미신청';
};

const getResponseData = (response, fallbackValue = null) => {
    if (response?.data?.success) {
        return response.data.data;
    }
    return fallbackValue;
};

export const useSurveyStore = defineStore('survey', () => {
    // ==========================================
    // State (ref 활용)
    // ==========================================
    const beneficiary_list = ref([]);
    const my_beneficiaries = ref([]);
    const selected_bene_detail = ref({});
    const selected_bene_id = ref(null);
    const application_list = ref([]);
    const is_survey_visible = ref(false);
    const is_view_mode = ref(false);
    const view_survey_data = ref([]);
    const view_answers = ref({});
    const view_app_id = ref(null);
    const view_app_status = ref(null);
    const priority_data = ref(createPriorityState());

    // ==========================================
    // Getters (computed 활용)
    // ==========================================
    const priorityStatusKor = computed(() => {
        const progressStatus = priority_data.value.progress_status;
        const rawPriorityCode = priority_data.value.priority_status || selected_bene_detail.value?.priority_status;

        if (progressStatus === 'pending') return '승인 대기';
        if (progressStatus === 'rejected') return '반려';
        if (!rawPriorityCode || rawPriorityCode === 'none') return '미신청';

        return getPriorityLabel(rawPriorityCode);
    });

    // ==========================================
    // Actions (일반 함수 활용)
    // ==========================================
    function resetPriorityState() {
        priority_data.value = createPriorityState();
    }

    function resetSurveyViewState() {
        is_survey_visible.value = false;
        is_view_mode.value = false;
        view_survey_data.value = [];
        view_answers.value = {};
        view_app_id.value = null;
        view_app_status.value = null;
    }

    function resetSelectedBeneficiaryState() {
        selected_bene_detail.value = {};
        application_list.value = [];
        resetPriorityState();
    }

    async function fetchBeneficiaryDetail(beneId) {
        if (!beneId) {
            selected_bene_detail.value = {};
            return;
        }

        try {
            const response = await axios.get(`/api/abc/bene/${beneId}`);
            selected_bene_detail.value = getResponseData(response, response.data) || {};
        } catch (error) {
            console.error('지원대상자 상세 조회 실패:', error);
            selected_bene_detail.value = {};
        }
    }

    async function fetchPriorityInfo(beneId) {
        if (!beneId) {
            resetPriorityState();
            return;
        }

        try {
            const response = await axios.get(`/api/abc/priority/${beneId}`);
            const priorityInfo = getResponseData(response);

            if (!priorityInfo) {
                resetPriorityState();
                return;
            }

            priority_data.value = {
                progress_status: String(priorityInfo.progress_status || 'none').toLowerCase(),
                priority_status: String(priorityInfo.priority_status || '').toLowerCase(),
                rejection_reason: priorityInfo.rejection_reason || '',
                approval_date: priorityInfo.approval_date || null
            };
        } catch (error) {
            console.error('대기단계 조회 실패:', error);
            resetPriorityState();
        }
    }

    async function fetchBeneficiaryList() {
        const authStore = useAuthStore();

        if (!authStore.isLoggedIn || !authStore.userId) {
            beneficiary_list.value = [];
            my_beneficiaries.value = [];
            return;
        }

        try {
            const response = await axios.get(`/api/recipient/list/${authStore.userId}`);
            const list = Array.isArray(response.data?.data) ? response.data.data : Array.isArray(response.data?.list) ? response.data.list : [];

            beneficiary_list.value = list;
            my_beneficiaries.value = list;
        } catch (error) {
            console.error('지원대상자 목록 조회 실패:', error);
            beneficiary_list.value = [];
            my_beneficiaries.value = [];
        }
    }

    async function fetchApplicationList(beneId) {
        if (!beneId) {
            application_list.value = [];
            return;
        }

        try {
            const response = await axios.get(`/api/survey/list/${beneId}`);
            application_list.value = getResponseData(response, []) || [];
        } catch (error) {
            console.error('지원신청서 목록 조회 실패:', error);
            application_list.value = [];
        }
    }

    async function selectBeneficiary(beneId) {
        selected_bene_id.value = beneId || null;
        resetSurveyViewState();
        resetSelectedBeneficiaryState();

        if (!beneId) {
            return;
        }

        await Promise.all([fetchBeneficiaryDetail(beneId), fetchApplicationList(beneId), fetchPriorityInfo(beneId)]);
    }

    async function requestPriority(stageNameKor) {
        const priorityCode = PRIORITY_MAP[stageNameKor] || String(stageNameKor || '').toLowerCase();

        if (!selected_bene_id.value || !priorityCode) {
            return;
        }

        try {
            const response = await axios.post('/api/abc/priority/request', {
                bene_id: selected_bene_id.value,
                priority_status: priorityCode,
                progress_status: 'pending'
            });

            if (response.data?.success) {
                await Promise.all([fetchPriorityInfo(selected_bene_id.value), fetchBeneficiaryDetail(selected_bene_id.value), fetchApplicationList(selected_bene_id.value)]);
                alert('대기단계 요청이 완료되었습니다.');
            }
        } catch (error) {
            console.error('대기단계 요청 실패:', error);
        }
    }

    async function cancelPriority() {
        if (!selected_bene_id.value) {
            return;
        }

        try {
            const response = await axios.post('/api/abc/priority/cancel', {
                bene_id: selected_bene_id.value
            });

            if (response.data?.success) {
                resetPriorityState();
                await Promise.all([fetchBeneficiaryDetail(selected_bene_id.value), fetchApplicationList(selected_bene_id.value)]);
                alert('요청이 취소되었습니다.');
            }
        } catch (error) {
            console.error('대기단계 취소 실패:', error);
            alert('취소 중 오류가 발생했습니다.');
        }
    }

    function openSurvey() {
        is_view_mode.value = false;
        is_survey_visible.value = true;
        view_app_id.value = null;
        view_app_status.value = null;
    }

    function closeSurvey() {
        resetSurveyViewState();
    }

    async function loadApplicationView(appId) {
        try {
            const response = await axios.get(`/api/survey/result/${appId}`);
            const viewData = getResponseData(response);

            if (!viewData) {
                return;
            }

            view_survey_data.value = viewData.survey_data.items;
            view_answers.value = viewData.answers;
            view_app_status.value = viewData.app_info.app_status || '대기';
            is_view_mode.value = true;
            is_survey_visible.value = true;
            view_app_id.value = appId;
        } catch (error) {
            console.error('지원신청서 상세 조회 실패:', error);
            alert('신청서 정보를 불러오지 못했습니다.');
        }
    }

    async function deleteApplication() {
        if (!view_app_id.value) {
            return;
        }

        if (!confirm('정말 이 지원신청서를 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.')) {
            return;
        }

        try {
            const response = await axios.delete(`/api/survey/application/${view_app_id.value}`);

            if (response.data?.success) {
                alert('신청서가 삭제되었습니다.');
                closeSurvey();

                if (selected_bene_id.value) {
                    await fetchApplicationList(selected_bene_id.value);
                }
            }
        } catch (error) {
            console.error('지원신청서 삭제 실패:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    }

    function clearStore() {
        beneficiary_list.value = [];
        my_beneficiaries.value = [];
        selected_bene_id.value = null;
        resetSelectedBeneficiaryState();
        resetSurveyViewState();
    }

    // ==========================================
    // Return (컴포넌트에 노출할 상태와 메서드)
    // ==========================================
    return {
        // State
        beneficiary_list,
        my_beneficiaries,
        selected_bene_detail,
        selected_bene_id,
        application_list,
        is_survey_visible,
        is_view_mode,
        view_survey_data,
        view_answers,
        view_app_id,
        view_app_status,
        priority_data,

        // Getters
        priorityStatusKor,

        // Actions
        resetPriorityState,
        resetSurveyViewState,
        resetSelectedBeneficiaryState,
        fetchBeneficiaryDetail,
        fetchPriorityInfo,
        fetchBeneficiaryList,
        fetchApplicationList,
        selectBeneficiary,
        requestPriority,
        cancelPriority,
        openSurvey,
        closeSurvey,
        loadApplicationView,
        deleteApplication,
        clearStore
    };
});
