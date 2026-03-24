// useSurveyStore.js
import { defineStore } from 'pinia';
import axios from 'axios';

export const useSurveyStore = defineStore('survey', {
    state: () => ({
        login_user_id: null,
        login_user_name: null,
        beneficiary_list: [], // 원본 전체 목록
        my_beneficiaries: [], // 필터링된 "내 가족" 목록
        selected_bene_detail: {}, // 선택된 대상자 상세 정보

        // --- [신규 추가 상태] ---
        selected_bene_id: null, // 현재 선택된 대상자 ID
        application_list: [], // 선택된 대상자의 신청서 리스트
        is_survey_visible: false // 우측 설문지창 표시 여부
    }),

    actions: {
        clearStore() {
            this.login_user_id = null;
            this.login_user_name = null;
            this.my_beneficiaries = [];
            this.selected_bene_detail = {};
            this.selected_bene_id = null;
            this.application_list = [];
            this.is_survey_visible = false;
        },

        setLoginUser(id, name) {
            this.login_user_id = id;
            this.login_user_name = name;
        },

        async fetchBeneficiaryList() {
            try {
                const res = await axios.get('http://localhost:3000/api/beneficiaries');
                const allList = res.data;
                this.beneficiary_list = allList;

                const filtered = [];
                for (const bene of allList) {
                    const detailRes = await axios.get(`http://localhost:3000/api/beneficiaries/${bene.bene_id}`);
                    if (detailRes.data && detailRes.data.family_name === this.login_user_name) {
                        filtered.push(bene);
                    }
                }
                this.my_beneficiaries = filtered;
            } catch (error) {
                console.error('데이터 로드 실패:', error);
            }
        },

        async fetchBeneficiaryDetail(beneId) {
            if (!beneId) {
                this.selected_bene_detail = {};
                return;
            }
            try {
                const res = await axios.get(`http://localhost:3000/api/beneficiaries/${beneId}`);
                this.selected_bene_detail = res.data;
            } catch (error) {
                console.error('상세 로드 실패:', error);
            }
        },

        // --- [신규: 대상자 선택 통합 로직] ---
        async selectBeneficiary(beneId) {
            this.selected_bene_id = beneId;
            this.is_survey_visible = false; // 다른 대상자를 선택하면 일단 설문창을 닫음

            if (!beneId) {
                this.selected_bene_detail = {};
                this.application_list = [];
                return;
            }

            // 1. 상세 정보 불러오기
            await this.fetchBeneficiaryDetail(beneId);

            // 2. 해당 대상자의 신청서 리스트 불러오기
            await this.fetchApplicationList(beneId);
        },

        // --- [신규: 신청서 리스트 불러오기 (임시 목업)] ---
        async fetchApplicationList(beneId) {
            try {
                // 실제 백엔드 연동 시:
                // const res = await axios.get(`http://localhost:3000/api/applications?beneId=${beneId}`);
                // this.application_list = res.data;

                // [프론트엔드 테스트용 목업 데이터]
                const beneName = this.my_beneficiaries.find((b) => b.bene_id === beneId)?.bene_name || '대상자';
                this.application_list = [
                    { id: 1, writer: this.login_user_name, bene_name: beneName, date: '2026.01.25' },
                    { id: 2, writer: this.login_user_name, bene_name: beneName, date: '2026.02.10' }
                ];
            } catch (error) {
                console.error('리스트 로드 실패:', error);
            }
        },

        // --- [신규: 설문창 제어] ---
        openSurvey() {
            this.is_survey_visible = true;
        }
    }
});
