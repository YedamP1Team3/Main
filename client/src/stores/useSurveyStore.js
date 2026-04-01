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

export const useSurveyStore = defineStore('survey', {
    state: () => ({
        beneficiary_list: [],
        my_beneficiaries: [],
        selected_bene_detail: {},
        selected_bene_id: null,
        application_list: [],
        is_survey_visible: false,
        is_view_mode: false,
        view_survey_data: [],
        view_answers: {},
        view_app_id: null,
        view_app_status: null,
        priority_data: createPriorityState()
    }),

    getters: {
        // 컴포넌트마다 상태 문자열을 if/else로 풀지 않게,
        // store에서 화면용 문구를 한 번 가공해 제공한다.
        priorityStatusKor: (state) => {
            const progressStatus = state.priority_data.progress_status;
            const rawPriorityCode = state.priority_data.priority_status || state.selected_bene_detail?.priority_status;

            if (progressStatus === 'pending') return '승인 대기';
            if (progressStatus === 'rejected') return '반려';
            if (!rawPriorityCode || rawPriorityCode === 'none') return '미신청';

            return getPriorityLabel(rawPriorityCode);
        }
    },

    actions: {
        resetPriorityState() {
            this.priority_data = createPriorityState();
        },

        resetSurveyViewState() {
            this.is_survey_visible = false;
            this.is_view_mode = false;
            this.view_survey_data = [];
            this.view_answers = {};
            this.view_app_id = null;
            this.view_app_status = null;
        },

        resetSelectedBeneficiaryState() {
            this.selected_bene_detail = {};
            this.application_list = [];
            this.resetPriorityState();
        },

        // 대상자 상세에는 담당자, 가족, 현재 대기단계 같은 공통 정보가 들어 있다.
        // 여러 화면이 이 데이터를 같이 쓰므로 store에서 한 번만 관리하면 중복 호출을 줄이기 쉽다.
        async fetchBeneficiaryDetail(beneId) {
            if (!beneId) {
                this.selected_bene_detail = {};
                return;
            }

            try {
                const response = await axios.get(`/api/abc/bene/${beneId}`);
                this.selected_bene_detail = getResponseData(response, response.data) || {};
            } catch (error) {
                console.error('지원대상자 상세 조회 실패:', error);
                this.selected_bene_detail = {};
            }
        },

        async fetchPriorityInfo(beneId) {
            if (!beneId) {
                this.resetPriorityState();
                return;
            }

            try {
                const response = await axios.get(`/api/abc/priority/${beneId}`);
                const priorityInfo = getResponseData(response);

                if (!priorityInfo) {
                    this.resetPriorityState();
                    return;
                }

                this.priority_data = {
                    progress_status: String(priorityInfo.progress_status || 'none').toLowerCase(),
                    priority_status: String(priorityInfo.priority_status || '').toLowerCase(),
                    rejection_reason: priorityInfo.rejection_reason || '',
                    approval_date: priorityInfo.approval_date || null
                };
            } catch (error) {
                console.error('대기단계 조회 실패:', error);
                this.resetPriorityState();
            }
        },

        // recipient API는 보호자 기준 대상자 목록을 내려주는 전용 API라
        // 전체 목록을 받아 이름으로 거르는 방식보다 의도가 더 분명하다.
        async fetchBeneficiaryList() {
            const authStore = useAuthStore();

            if (!authStore.isLoggedIn || !authStore.userId) {
                this.beneficiary_list = [];
                this.my_beneficiaries = [];
                return;
            }

            try {
                const response = await axios.get(`/api/recipient/list/${authStore.userId}`);
                const list = Array.isArray(response.data?.data) ? response.data.data : Array.isArray(response.data?.list) ? response.data.list : [];

                this.beneficiary_list = list;
                this.my_beneficiaries = list;
            } catch (error) {
                console.error('지원대상자 목록 조회 실패:', error);
                this.beneficiary_list = [];
                this.my_beneficiaries = [];
            }
        },

        async fetchApplicationList(beneId) {
            if (!beneId) {
                this.application_list = [];
                return;
            }

            try {
                const response = await axios.get(`/api/survey/list/${beneId}`);
                this.application_list = getResponseData(response, []) || [];
            } catch (error) {
                console.error('지원신청서 목록 조회 실패:', error);
                this.application_list = [];
            }
        },

        // 지원대상자가 바뀌면 이전 대상자의 상세 화면과 목록이 남아 있으면 안 된다.
        // 먼저 선택 상태를 비우고, 그 다음 필요한 API를 병렬로 불러와 화면 전환 체감을 빠르게 유지한다.
        async selectBeneficiary(beneId) {
            this.selected_bene_id = beneId || null;
            this.resetSurveyViewState();
            this.resetSelectedBeneficiaryState();

            if (!beneId) {
                return;
            }

            await Promise.all([this.fetchBeneficiaryDetail(beneId), this.fetchApplicationList(beneId), this.fetchPriorityInfo(beneId)]);
        },

        async requestPriority(stageNameKor) {
            const priorityCode = PRIORITY_MAP[stageNameKor] || String(stageNameKor || '').toLowerCase();

            if (!this.selected_bene_id || !priorityCode) {
                return;
            }

            try {
                const response = await axios.post('/api/abc/priority/request', {
                    bene_id: this.selected_bene_id,
                    priority_status: priorityCode,
                    progress_status: 'pending'
                });

                if (response.data?.success) {
                    // 대기단계 요청은 신청 단계에도 영향을 주므로
                    // priority만 새로 읽지 말고 대상자 상세와 신청서 목록도 함께 갱신한다.
                    await Promise.all([this.fetchPriorityInfo(this.selected_bene_id), this.fetchBeneficiaryDetail(this.selected_bene_id), this.fetchApplicationList(this.selected_bene_id)]);
                    alert('대기단계 요청이 완료되었습니다.');
                }
            } catch (error) {
                console.error('대기단계 요청 실패:', error);
            }
        },

        async cancelPriority() {
            if (!this.selected_bene_id) {
                return;
            }

            try {
                const response = await axios.post('/api/abc/priority/cancel', {
                    bene_id: this.selected_bene_id
                });

                if (response.data?.success) {
                    this.resetPriorityState();
                    await Promise.all([this.fetchBeneficiaryDetail(this.selected_bene_id), this.fetchApplicationList(this.selected_bene_id)]);
                    alert('요청이 취소되었습니다.');
                }
            } catch (error) {
                console.error('대기단계 취소 실패:', error);
                alert('취소 중 오류가 발생했습니다.');
            }
        },

        // 작성 모드와 조회 모드는 같은 영역을 공유하지만 보여줄 데이터가 다르다.
        // store에서 모드 상태를 같이 관리하면 상세 패널 컴포넌트 분기가 단순해진다.
        openSurvey() {
            this.is_view_mode = false;
            this.is_survey_visible = true;
            this.view_app_id = null;
            this.view_app_status = null;
        },

        closeSurvey() {
            this.resetSurveyViewState();
        },

        // 상세 보기는 설문 구조와 실제 답변이 동시에 있어야 화면을 그릴 수 있다.
        async loadApplicationView(appId) {
            try {
                const response = await axios.get(`/api/survey/result/${appId}`);
                const viewData = getResponseData(response);

                if (!viewData) {
                    return;
                }

                this.view_survey_data = viewData.survey_data.items;
                this.view_answers = viewData.answers;
                this.view_app_status = viewData.app_info.app_status || '대기';
                this.is_view_mode = true;
                this.is_survey_visible = true;
                this.view_app_id = appId;
            } catch (error) {
                console.error('지원신청서 상세 조회 실패:', error);
                alert('신청서 정보를 불러오지 못했습니다.');
            }
        },

        async deleteApplication() {
            if (!this.view_app_id) {
                return;
            }

            if (!confirm('정말 이 지원신청서를 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.')) {
                return;
            }

            try {
                const response = await axios.delete(`/api/survey/application/${this.view_app_id}`);

                if (response.data?.success) {
                    alert('신청서가 삭제되었습니다.');
                    this.closeSurvey();

                    if (this.selected_bene_id) {
                        await this.fetchApplicationList(this.selected_bene_id);
                    }
                }
            } catch (error) {
                console.error('지원신청서 삭제 실패:', error);
                alert('삭제 중 오류가 발생했습니다.');
            }
        },

        clearStore() {
            this.beneficiary_list = [];
            this.my_beneficiaries = [];
            this.selected_bene_id = null;
            this.resetSelectedBeneficiaryState();
            this.resetSurveyViewState();
        }
    }
});
