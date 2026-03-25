const express = require("express");
const router = express.Router();

const adminService = require("../service/adsupport_service.js");

router.get("/AdsupportPlan/:beneId", async (req, res) => {
  let target = req.params.beneId;
  let result = await adminService.AdSupportPlanService(target);
  res.send(result);
});

router.get("/AdDetailSupportPlan/:planId", async (req, res) => {
  let target = req.params.planId;
  let result = await adminService.AdDetailSupportPlanService(target);
  res.send(result);
});

router.put("/ApprovalChange/:planId", async (req, res) => {
  let planNo = req.params.planId;
  let target = req.body;
  let result = await adminService.ApprovalChangeService(planNo, target);
  res.send(result);
});

router.put("/Return/:planId", async (req, res) => {
  let planNo = req.params.planId;
  let target = req.body;
  let result = await adminService.ReturnService(planNo, target);
  res.send(result);
});

router.get("/AdSupportList", async (req, res) => {
  let agencyId = req.query.agency_id;
  let result = await adminService.AdSupportListService(agencyId);
  res.send(result);
});

module.exports = router;
