const express = require("express");
const router = express.Router();

const userService = require("../service/adsupport_service.js");

router.get("/AdsupportPlan/:beneId", async (req, res) => {
  let target = req.params.beneId;
  let result = await userService.adSupportPlan_service(target);
  res.send(result);
});

router.get("/AddetailSupportPlan/:planId", async (req, res) => {
  let target = req.params.planId;
  let result = await userService.adDetailSupportPlanService(target);
  res.send(result);
});

router.put("/updateApproval/:planId", async (req, res) => {
  let planNo = req.params.planId;
  let target = req.body;
  let result = await userService.updateApprovalService(planNo, target);
  res.send(result);
});

router.put("/updateReturn/:planId", async (req, res) => {
  let planNo = req.params.planId;
  let target = req.body;
  let result = await userService.updateReturnService(planNo, target);
  res.send(result);
});

module.exports = router;
