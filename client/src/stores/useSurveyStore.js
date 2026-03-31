import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const createPriorityState = () => ({
    progress_status: 'none',
    priority_status: '',
    rejection_reason: '',
    approval_date: null
});

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

export const useSurveyStore = defineStore('survey', {
    state: () => ({
        // 로그인한 보호자가 볼 수 있는 지원대상자 목록
        beneficiary_list: [],
        my_beneficiaries: [],

        // 현재 화면에서 선택한 지원대상자
        selected_bene_detail: {},
        selected_bene_id: null,

        // 선택된 대상자의 신청서/보기 상태
        application_list: [],
        is_survey_visible: false,
        is_view_mode: false,
        view_survey_data: [],
        view_answers: {},
        view_app_id: null,
        view_app_status: null,

        // 대기단계(우선순위) 상태
        priority_data: createPriorityState()
    }),

    getters: {
        // 화면에서는 DB 코드보다 사람이 읽을 수 있는 텍스트가 필요해서
        // store에서 한 번 변환해 둔다.
        priorityStatusKor: (state) => {
            const progress = state.priority_data.progress_status;
            const rawCode = state.priority_data.priority_status || state.selected_bene_detail?.priority_status;

            if (progress === 'pending') return '대기';
            if (progress === 'rejected') return '반려';
            if (!rawCode || rawCode === 'none') return '미신청';

            return getPriorityLabel(rawCode);
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

        async fetchBeneficiaryDetail(beneId) {
            if (!beneId) {
                this.selected_bene_detail = {};
                return;
            }

            try {
                const res = await axios.get(`/api/abc/bene/${beneId}`);
                this.selected_bene_detail = res.data;
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
                const res = await axios.get(`/api/abc/priority/${beneId}`);
                const targetData = res.data?.success ? res.data.data : null;

                if (!targetData) {
                    this.resetPriorityState();
                    return;
                }

                this.priority_data = {
                    progress_status: String(targetData.progress_status || 'none').toLowerCase(),
                    priority_status: String(targetData.priority_status || '').toLowerCase(),
                    rejection_reason: targetData.rejection_reason || '',
                    approval_date: targetData.approval_date || null
                };
            } catch (error) {
                console.error('대기단계 조회 실패:', error);
                this.resetPriorityState();
            }
        },

        async fetchBeneficiaryList() {
            const authStore = useAuthStore();

            if (!authStore.isLoggedIn || !authStore.userId) {
                this.beneficiary_list = [];
                this.my_beneficiaries = [];
                return;
            }

            try {
                const res = await axios.get(`/api/recipient/list/${authStore.userId}`);
                const list = res.data?.success ? res.data.list || [] : [];
                console.log(res.data.list);

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
                const res = await axios.get(`/api/survey/list/${beneId}`);
                this.application_list = res.data?.success ? res.data.data || [] : [];
            } catch (error) {
                console.error('신청서 목록 조회 실패:', error);
                this.application_list = [];
            }
        },

        async selectBeneficiary(beneId) {
            this.selected_bene_id = beneId || null;
            this.resetSurveyViewState();
            this.resetSelectedBeneficiaryState();

            if (!beneId) {
                return;
            }

            // 대상자를 바꾸면 상세, 신청서 목록, 대기단계를 같이 다시 읽어온다.
            await Promise.all([this.fetchBeneficiaryDetail(beneId), this.fetchApplicationList(beneId), this.fetchPriorityInfo(beneId)]);
        },

        async requestPriority(stageNameKor) {
            const priorityCode = PRIORITY_MAP[stageNameKor];

            if (!this.selected_bene_id || !priorityCode) {
                return;
            }

            try {
                const payload = {
                    bene_id: this.selected_bene_id,
                    priority_status: priorityCode,
                    progress_status: 'pending'
                };

                const res = await axios.post('/api/abc/priority/request', payload);

                if (res.data.success) {
                    await Promise.all([this.fetchPriorityInfo(this.selected_bene_id), this.fetchBeneficiaryDetail(this.selected_bene_id), this.fetchApplicationList(this.selected_bene_id)]);
                    alert('승인 요청이 완료되었습니다.');
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
                const res = await axios.post('/api/abc/priority/cancel', {
                    bene_id: this.selected_bene_id
                });

                if (res.data.success) {
                    this.resetPriorityState();
                    await Promise.all([this.fetchBeneficiaryDetail(this.selected_bene_id), this.fetchApplicationList(this.selected_bene_id)]);
                    alert('요청을 취소했습니다.');
                }
            } catch (error) {
                console.error('대기단계 취소 실패:', error);
                alert('취소 중 오류가 발생했습니다.');
            }
        },

        // 신청서 작성 폼을 여는 액션이다.
        // 실제 폼 렌더링은 각 화면 컴포넌트가 담당하고, store는 열림 상태만 관리한다.
        openSurvey() {
            this.is_view_mode = false;
            this.is_survey_visible = true;
            this.view_app_id = null;
            this.view_app_status = null;
        },

        closeSurvey() {
            this.resetSurveyViewState();
        },

        async loadApplicationView(appId) {
            try {
                const res = await axios.get(`/api/survey/result/${appId}`);

                if (res.data.success) {
                    this.view_survey_data = res.data.data.survey_data.items;
                    this.view_answers = res.data.data.answers;
                    this.view_app_status = res.data.data.app_info.app_status || '대기';
                    this.is_view_mode = true;
                    this.is_survey_visible = true;
                    this.view_app_id = appId;
                }
            } catch (error) {
                console.error('신청서 상세 조회 실패:', error);
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
                const res = await axios.delete(`/api/survey/application/${this.view_app_id}`);

                if (res.data.success) {
                    alert('신청서가 삭제되었습니다.');
                    this.closeSurvey();

                    if (this.selected_bene_id) {
                        await this.fetchApplicationList(this.selected_bene_id);
                    }
                }
            } catch (error) {
                console.error('신청서 삭제 실패:', error);
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
