const express = require("express");
const router = express.Router();

const userService = require("../service/user_service.js");

//db확인
router.get("/users", async (req, res) => {
  let result = await userService.findAll();
  res.send(result);
});
//지원자리스트 조회
router.get("/beneficiaries/names", async (req, res) => {
  let managerId = req.query.user_id;
  let result = await userService.getBeneficiariesNames(managerId);
  res.send(result);
});
//지원자세부조회
router.get("/beneficiaries/:id", async (req, res) => {
  let target = req.params.id;
  let result = await userService.getBeneficiariesDetail(target);
  res.send(result);
});
//지원계획서조회 목록
router.get("/beneficiaries/:beneId/support-plan", async (req, res) => {
  let target = req.params.beneId;
  let result = await userService.getSupportPlanList(target);
  res.send(result);
});
//지원계획서생성
router.post("/support-plan", async (req, res) => {
  let target = req.body;
  let result = await userService.createSupportPlan(target);
  res.send(result);
});
//지원계획서임시 조회
router.get("/beneficiaries/:beneId/support-plans/temp", async (req, res) => {
  let target = req.params.beneId;
  let result = await userService.getSupportPlanTempList(target);
  res.send(result);
});
//지원계획서상세조회
router.get("/support-plans/:planId", async (req, res) => {
  let target = req.params.planId;
  let result = await userService.getSupportPlanDetail(target);
  res.send(result);
});
//지원계획서삭제
router.delete("/support-plans/:planId", async (req, res) => {
  let planNo = req.params.planId;
  let result = await userService.removeSupportPlan(planNo);
  res.send(result);
});
//지원계획서 승인요청 업데이트
router.put("/support-plans/:planId", async (req, res) => {
  let planNo = req.params.planId;
  let target = req.body;
  let result = await userService.applySupportPlan(planNo, target);
  res.send(result);
});
//지원계획서업데이트(임시)
router.put("/support-plans/:planId/temp", async (req, res) => {
  let planNo = req.params.planId;
  let target = req.body;
  let result = await userService.updateTempPlan(planNo, target);
  res.send(result);
});

module.exports = router;
