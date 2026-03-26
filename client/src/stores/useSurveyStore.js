import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

export const PRIORITY_MAP = {
    urgent: '긴급',
    high: '중점',
    planned: '계획',
    긴급: 'urgent',
    중점: 'high',
    계획: 'planned'
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
        view_app_id: null, // 💡 [추가] 현재 보고 있는 신청서의 고유 ID를 저장

        priority_data: {
            progress_status: 'none',
            priority_status: '',
            rejection_reason: '',
            approval_date: null
        }
    }),
    getters: {
        priorityStatusKor: (state) => {
            if (state.priority_data.progress_status === 'pending') {
                return '대기';
            }
            const dbCode = state.selected_bene_detail?.priority_status;
            if (!dbCode) return '미신청';

            const lowerCode = String(dbCode).toLowerCase();
            return PRIORITY_MAP[lowerCode] || dbCode;
        }
    },

    actions: {
        async fetchPriorityInfo(beneId) {
            try {
                const res = await axios.get(`http://localhost:3000/abc/priority/${beneId}`);
                if (res.data && res.data.success && res.data.data) {
                    const dbData = res.data.data;
                    const targetData = Array.isArray(dbData) ? dbData[0] : dbData;

                    if (targetData) {
                        this.priority_data.progress_status = String(targetData.progress_status || 'none').toLowerCase();
                        this.priority_data.priority_status = String(targetData.priority_status || '').toLowerCase();
                        this.priority_data.rejection_reason = targetData.rejection_reason || '';
                        this.priority_data.approval_date = targetData.approval_date || null;
                    } else {
                        this.priority_data.progress_status = 'none';
                    }
                } else {
                    this.priority_data.progress_status = 'none';
                }
            } catch (error) {
                console.error('대기단계 정보 로드 실패:', error);
                this.priority_data.progress_status = 'none';
            }
        },

        async requestPriority(stageNameKor) {
            const dbCode = PRIORITY_MAP[stageNameKor];
            try {
                const payload = {
                    bene_id: this.selected_bene_id,
                    priority_status: dbCode,
                    progress_status: 'pending'
                };
                const res = await axios.post(`http://localhost:3000/abc/priority/request`, payload);

                if (res.data.success) {
                    await this.fetchPriorityInfo(this.selected_bene_id);
                    await this.fetchBeneficiaryDetail(this.selected_bene_id);
                    await this.fetchApplicationList(this.selected_bene_id);
                    alert('승인 요청이 완료되었습니다.');
                }
            } catch (error) {
                console.error('요청 실패:', error);
            }
        },

        async cancelPriority() {
            try {
                const res = await axios.post(`http://localhost:3000/abc/priority/cancel`, {
                    bene_id: this.selected_bene_id
                });

                if (res.data.success) {
                    this.priority_data.progress_status = 'NONE';
                    this.priority_data.priority_status = '';
                    await this.fetchBeneficiaryDetail(this.selected_bene_id);
                    await this.fetchApplicationList(this.selected_bene_id);
                    alert('신청이 취소되었습니다.');
                }
            } catch (error) {
                console.error('취소 실패:', error);
                alert('취소 중 오류가 발생했습니다.');
            }
        },

        async fetchBeneficiaryList() {
            const authStore = useAuthStore();
            if (!authStore.isLoggedIn) return;

            try {
                const res = await axios.get('http://localhost:3000/abc/bene');
                const allList = res.data;
                this.beneficiary_list = allList;

                const filtered = [];
                for (const bene of allList) {
                    const detailRes = await axios.get(`http://localhost:3000/abc/bene/${bene.bene_id}`);
                    if (detailRes.data && detailRes.data.family_name === authStore.userName) {
                        filtered.push(bene);
                    }
                }
                this.my_beneficiaries = filtered;
            } catch (error) {
                console.error('데이터 로드 실패:', error);
            }
        },

        async fetchBeneficiaryDetail(beneId) {
            if (!beneId) return (this.selected_bene_detail = {});
            try {
                const res = await axios.get(`http://localhost:3000/abc/bene/${beneId}`);
                this.selected_bene_detail = res.data;
            } catch (error) {
                console.error('상세 로드 실패:', error);
            }
        },

        async selectBeneficiary(beneId) {
            this.selected_bene_id = beneId;
            this.is_survey_visible = false;

            if (!beneId) {
                this.selected_bene_detail = {};
                this.application_list = [];
                this.priority_data.progress_status = 'none';
                this.priority_data.priority_status = '';
                return;
            }

            this.selected_bene_detail = {};
            this.priority_data.progress_status = 'none';

            await Promise.all([this.fetchBeneficiaryDetail(beneId), this.fetchApplicationList(beneId), this.fetchPriorityInfo(beneId)]);
        },

        async fetchApplicationList(beneId) {
            try {
                const res = await axios.get(`http://localhost:3000/survey/list/${beneId}`);
                if (res.data.success) {
                    this.application_list = res.data.data;
                } else {
                    this.application_list = [];
                }
            } catch (error) {
                console.error('리스트 로드 실패:', error);
                this.application_list = [];
            }
        },

        openSurvey() {
            this.is_view_mode = false;
            this.is_survey_visible = true;
            this.view_app_id = null; // 💡 작성 시에는 초기화
        },

        closeSurvey() {
            this.is_survey_visible = false;
            this.is_view_mode = false;
            this.view_app_id = null; // 💡 닫을 때 초기화
        },

        async loadApplicationView(appId) {
            try {
                const res = await axios.get(`http://localhost:3000/survey/result/${appId}`);
                if (res.data.success) {
                    this.view_survey_data = res.data.data.survey_data.items;
                    this.view_answers = res.data.data.answers;
                    this.is_view_mode = true;
                    this.is_survey_visible = true;
                    this.view_app_id = appId; // 💡 [수정] 조회 시 식별할 수 있도록 저장
                }
            } catch (error) {
                console.error('조회 로드 실패:', error);
                alert('신청서 정보를 불러오는데 실패했습니다.');
            }
        },

        // 💡 [추가] 신청서 삭제 액션
        async deleteApplication() {
            if (!this.view_app_id) return;

            if (!confirm('정말 이 지원신청서를 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.')) {
                return;
            }

            try {
                const res = await axios.delete(`http://localhost:3000/survey/application/${this.view_app_id}`);
                if (res.data.success) {
                    alert('신청서가 삭제되었습니다.');
                    this.closeSurvey(); // 화면 닫기

                    // 삭제 후 리스트 최신화
                    if (this.selected_bene_id) {
                        await this.fetchApplicationList(this.selected_bene_id);
                    }
                }
            } catch (error) {
                console.error('삭제 실패:', error);
                alert('삭제 중 오류가 발생했습니다.');
            }
        },

        clearStore() {
            this.my_beneficiaries = [];
            this.selected_bene_detail = {};
            this.selected_bene_id = null;
            this.application_list = [];
            this.is_survey_visible = false;
            this.is_view_mode = false;
            this.view_survey_data = [];
            this.view_answers = {};
            this.view_app_id = null; // 💡 초기화 포함
            this.priority_data = {
                progress_status: 'none',
                priority_status: '',
                rejection_reason: '',
                approval_date: null
            };
        }
    }
});
