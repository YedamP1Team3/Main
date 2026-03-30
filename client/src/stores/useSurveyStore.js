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
            const prog = state.priority_data.progress_status;
            const dbCode = state.priority_data.priority_status || state.selected_bene_detail?.priority_status;

            // ⭐️ [핵심] 진행 상태에 따른 명확한 텍스트 분기
            if (prog === 'pending') return '대기';
            if (prog === 'rejected') return '반려됨'; // 반려 상태 명시

            // DB 코드가 없으면 미신청
            if (!dbCode || dbCode === 'none' || dbCode === '') return '미신청';

            // 승인 완료된 경우에만 해당 단계(긴급, 중점, 계획)를 보여줌
            const lowerCode = String(dbCode).toLowerCase();
            return PRIORITY_MAP[lowerCode] || '미신청';
        }
    },
    actions: {
        // 💡 1. 대상자 상세 정보 로드 (실패 시에도 초기화 보장)
        async fetchBeneficiaryDetail(beneId) {
            if (!beneId) {
                this.selected_bene_detail = {};
                return;
            }
            try {
                const res = await axios.get(`api/abc/bene/${beneId}`);
                this.selected_bene_detail = res.data;
            } catch (error) {
                console.error('상세 로드 실패:', error);
                this.selected_bene_detail = {}; // 오류 시 확실한 초기화
            }
        },

        // 💡 2. 대기단계 정보 로드 (잔상 완벽 제거)
        async fetchPriorityInfo(beneId) {
            // ID가 없으면 바로 초기화
            if (!beneId) {
                this.priority_data = { progress_status: 'none', priority_status: '', rejection_reason: '', approval_date: null };
                return;
            }

            try {
                const res = await axios.get(`api/abc/priority/${beneId}`);
                if (res.data && res.data.success && res.data.data) {
                    const dbData = res.data.data;
                    const targetData = Array.isArray(dbData) ? dbData[0] : dbData;

                    if (targetData) {
                        this.priority_data.progress_status = String(targetData.progress_status || 'none').toLowerCase();
                        this.priority_data.priority_status = String(targetData.priority_status || '').toLowerCase();
                        this.priority_data.rejection_reason = targetData.rejection_reason || '';
                        this.priority_data.approval_date = targetData.approval_date || null;
                    } else {
                        // [핵심 수정] DB에 데이터가 없으면 확실하게 모든 필드를 빈 값으로 날려야 합니다.
                        this.priority_data = { progress_status: 'none', priority_status: '', rejection_reason: '', approval_date: null };
                    }
                } else {
                    // [핵심 수정] 응답이 비정상일 때도 잔상 지우기
                    this.priority_data = { progress_status: 'none', priority_status: '', rejection_reason: '', approval_date: null };
                }
            } catch (error) {
                console.error('대기단계 정보 로드 실패:', error);
                // [핵심 수정] 에러 발생 시 이전 사람의 데이터가 남지 않도록 덮어쓰기
                this.priority_data = { progress_status: 'none', priority_status: '', rejection_reason: '', approval_date: null };
            }
        },

        // 💡 3. 대상자 선택 액션 (가장 중요: 선택 즉시 기존 데이터 날리기)
        async selectBeneficiary(beneId) {
            this.selected_bene_id = beneId;
            this.is_survey_visible = false;

            // [핵심 해결 포인트] 다른 대상자를 선택하는 즉시 화면에 보일 수 있는 모든 기존 상태를 완벽히 초기화합니다.
            this.selected_bene_detail = {};
            this.application_list = [];
            this.priority_data = {
                progress_status: 'none',
                priority_status: '',
                rejection_reason: '',
                approval_date: null
            };

            if (!beneId) return; // 선택 해제 시 여기서 종료

            // 초기화된 깨끗한 도화지 상태에서 새로운 대상자 데이터를 병렬로 불러옴
            await Promise.all([this.fetchBeneficiaryDetail(beneId), this.fetchApplicationList(beneId), this.fetchPriorityInfo(beneId)]);
        },

        // ===============================================
        // 아래부터는 기존 액션 코드와 100% 동일하게 유지
        // ===============================================
        async requestPriority(stageNameKor) {
            const dbCode = PRIORITY_MAP[stageNameKor];
            try {
                const payload = {
                    bene_id: this.selected_bene_id,
                    priority_status: dbCode,
                    progress_status: 'pending'
                };
                const res = await axios.post(`api/abc/priority/request`, payload);

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
                const res = await axios.post(`api/abc/priority/cancel`, {
                    bene_id: this.selected_bene_id
                });

                if (res.data.success) {
                    this.priority_data = { progress_status: 'none', priority_status: '', rejection_reason: '', approval_date: null };
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
                const res = await axios.get('api/abc/bene');
                const allList = res.data;
                this.beneficiary_list = allList;

                const filtered = [];
                for (const bene of allList) {
                    const detailRes = await axios.get(`api/abc/bene/${bene.bene_id}`);
                    if (detailRes.data && detailRes.data.family_name === authStore.userName) {
                        filtered.push(bene);
                    }
                }
                this.my_beneficiaries = filtered;
            } catch (error) {
                console.error('데이터 로드 실패:', error);
            }
        },

        async fetchApplicationList(beneId) {
            try {
                const res = await axios.get(`api/survey/list/${beneId}`);
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
            this.view_app_id = null;
        },

        closeSurvey() {
            this.is_survey_visible = false;
            this.is_view_mode = false;
            this.view_app_id = null;
        },

        async loadApplicationView(appId) {
            try {
                const res = await axios.get(`api/survey/result/${appId}`);
                if (res.data.success) {
                    this.view_survey_data = res.data.data.survey_data.items;
                    this.view_answers = res.data.data.answers;
                    this.is_view_mode = true;
                    this.is_survey_visible = true;
                    this.view_app_id = appId;
                }
            } catch (error) {
                console.error('조회 로드 실패:', error);
                alert('신청서 정보를 불러오는데 실패했습니다.');
            }
        },

        async deleteApplication() {
            if (!this.view_app_id) return;

            if (!confirm('정말 이 지원신청서를 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.')) {
                return;
            }

            try {
                const res = await axios.delete(`api/survey/application/${this.view_app_id}`);
                if (res.data.success) {
                    alert('신청서가 삭제되었습니다.');
                    this.closeSurvey();

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
            this.view_app_id = null;
            this.priority_data = {
                progress_status: 'none',
                priority_status: '',
                rejection_reason: '',
                approval_date: null
            };
        }
    }
});
