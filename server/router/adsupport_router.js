const express = require("express");
const router = express.Router();

const adminService = require("../service/adsupport_service.js");
//관리자가 지원자 계획서리스트 조회
router.get("/admin/beneficiaries/:beneId/support-plan", async (req, res) => {
  let target = req.params.beneId;
  let result = await adminService.getSupportPlanList(target);
  res.send(result);
});
//기관 계획서 조회
router.get("/admin/support-plan/:planId", async (req, res) => {
  let target = req.params.planId;
  let result = await adminService.getSupportPlanDetail(target);
  res.send(result);
});
//관리자 지원계획서 승인하기
router.put("/admin/support-plan/:planId/approval", async (req, res) => {
  let planNo = req.params.planId;
  let target = req.body;
  let result = await adminService.approveSupportPlan(planNo, target);
  res.send(result);
});
//관리자 지원계획서 반려
router.put("/admin/support-plan/:planId/return", async (req, res) => {
  let planNo = req.params.planId;
  let target = req.body;
  let result = await adminService.returnSupportPlan(planNo, target);
  res.send(result);
});
//반려사유 저장
router.post("/admin/support-plan/rejection-history", async (req, res) => {
  let target = req.body;
  let result = await adminService.addRejectionHistory(target);
  res.send(result);
});
//반려사유 조회 히스토리
router.get("/admin/support-plan/:planId/rejection-history", async (req, res) => {
  let target = req.params.planId;
  let result = await adminService.getRejectionHistory(target);
  res.send(result);
});
//기관에 등록된 지원자 이름 조회
router.get("/admin/beneficiaries/names", async (req, res) => {
  let agencyId = req.query.agency_id;
  let result = await adminService.getBeneficiariesNames(agencyId);
  res.send(result);
});

module.exports = router;
