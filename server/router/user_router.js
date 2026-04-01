const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploads.js");
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
//지원계획서생성(파일첨부)
router.post("/support-plan", upload.array("files"), async (req, res) => {
  let target = req.body;
  let files = req.files;

  let result = await userService.createSupportPlan(target, files);
  res.send(result);
});
//지원계획서임시생성
router.post("/temp-plan", async (req, res) => {
  let target = req.body;
  let result = await userService.createTempPlan(target);
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
//임시지원계획서상세조회
router.get("/temp-plans/:planId", async (req, res) => {
  let target = req.params.planId;
  let result = await userService.getTempPlanDetail(target);
  res.send(result);
});
//지원계획서삭제
router.delete("/support-plans/:planId", async (req, res) => {
  let planNo = req.params.planId;
  let result = await userService.removeSupportPlan(planNo);
  res.send(result);
});
//임시지원계획서 삭제
router.delete("/temp-plans/:planDraftId", async (req, res) => {
  let planNo = req.params.planDraftId;
  let result = await userService.removeTempPlan(planNo);
  res.send(result);
});
//지원계획서 승인요청 업데이트
router.put("/support-plans/:planId", async (req, res) => {
  let planNo = req.params.planId;
  let target = req.body;
  let result = await userService.resubmitSupportPlan(planNo, target);
  res.send(result);
});
//지원계획서 임시저장 업데이트
router.put("/support-plans/:planId/save", async (req, res) => {
  let planNo = req.params.planId;
  let target = req.body;
  let result = await userService.rejectSupportPlan(planNo, target);
  res.send(result);
});
//지원계획서업데이트(임시)
router.put("/temp-plans/:planDraftId", async (req, res) => {
  let planDraftId = req.params.planDraftId;
  let target = req.body;
  let result = await userService.updateTempPlan(planDraftId, target);
  res.send(result);
});

//지원계획서임시 승락
router.post("/temp-plans/approve", async (req, res) => {
  let target = req.body;
  let result = await userService.approveTempPlan(target);
  res.send(result);
});

module.exports = router;
