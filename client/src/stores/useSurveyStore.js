import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

export const useSurveyStore = defineStore('survey', {
    state: () => ({
        beneficiary_list: [],
        my_beneficiaries: [],
        selected_bene_detail: {},
        selected_bene_id: null,
        application_list: [],
        is_survey_visible: false,
        // ⭐️ [신규] 조회 모드용 상태 변수들
        is_view_mode: false, // 현재 창이 '조회 모드'인지 여부
        view_survey_data: [], // 과거에 작성했던 버전의 문항들
        view_answers: {} // 과거에 체크했던 답변들
    }),

    actions: {
        clearStore() {
            this.my_beneficiaries = [];
            this.selected_bene_detail = {};
            this.selected_bene_id = null;
            this.application_list = [];
            this.is_survey_visible = false;
            this.is_view_mode = false;
            this.view_survey_data = [];
            this.view_answers = {};
        },

        async fetchBeneficiaryList() {
            const authStore = useAuthStore(); // ⭐️ 현재 로그인한 유저 정보 꺼내기
            if (!authStore.isLoggedIn) return; // 로그인 안 되어 있으면 중지

            try {
                const res = await axios.get('http://localhost:3000/api/beneficiaries');
                const allList = res.data;
                this.beneficiary_list = allList;

                const filtered = [];
                for (const bene of allList) {
                    const detailRes = await axios.get(`http://localhost:3000/api/beneficiaries/${bene.bene_id}`);
                    // ⭐️ authStore.userName을 직접 비교!
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
                const res = await axios.get(`http://localhost:3000/api/beneficiaries/${beneId}`);
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
                return;
            }

            await this.fetchBeneficiaryDetail(beneId);
            await this.fetchApplicationList(beneId);
        },

        // ⭐️ [수정됨] 진짜 DB에서 리스트 불러오기
        async fetchApplicationList(beneId) {
            try {
                // 1. 가짜 목업 데이터 삭제하고 실제 API 호출!
                const res = await axios.get(`http://localhost:3000/survey/list/${beneId}`);

                if (res.data.success) {
                    this.application_list = res.data.data; // DB에서 가져온 진짜 리스트 꽂아넣기
                } else {
                    this.application_list = [];
                }
            } catch (error) {
                console.error('리스트 로드 실패:', error);
                this.application_list = []; // 에러 나면 빈 배열로 초기화
            }
        },

        // --- 설문창 제어 로직 ---
        openSurvey() {
            this.is_view_mode = false; // 추가하기를 누르면 작성 모드로 엶
            this.is_survey_visible = true;
        },
        closeSurvey() {
            this.is_survey_visible = false;
            this.is_view_mode = false;
        },

        // ⭐️ [신규] 목록 클릭 시 상세 데이터 불러오기
        async loadApplicationView(appId) {
            try {
                const res = await axios.get(`http://localhost:3000/survey/result/${appId}`);
                if (res.data.success) {
                    // 백엔드에서 조립해준 과거 데이터 덮어씌우기
                    this.view_survey_data = res.data.data.survey_data.items;
                    this.view_answers = res.data.data.answers;

                    // 화면을 조회 모드로 전환
                    this.is_view_mode = true;
                    this.is_survey_visible = true;
                }
            } catch (error) {
                console.error('조회 로드 실패:', error);
                alert('신청서 정보를 불러오는데 실패했습니다.');
            }
        }
    }
});
