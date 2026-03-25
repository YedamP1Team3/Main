const express = require("express");
const router = express.Router();

const userService = require("../service/adsupport_service.js");

router.get("/AdsupportPlan/:beneId", async (req, res) => {
  let target = req.params.beneId;
  let result = await userService.AdSupportPlanService(target);
  res.send(result);
});

router.get("/AdDetailSupportPlan/:planId", async (req, res) => {
  let target = req.params.planId;
  let result = await userService.AdDetailSupportPlanService(target);
  res.send(result);
});

router.put("/ApprovalChange/:planId", async (req, res) => {
  let planNo = req.params.planId;
  let target = req.body;
  let result = await userService.ApprovalChangeService(planNo, target);
  res.send(result);
});

router.put("/Return/:planId", async (req, res) => {
  let planNo = req.params.planId;
  let target = req.body;
  let result = await userService.ReturnService(planNo, target);
  res.send(result);
});

module.exports = router;
