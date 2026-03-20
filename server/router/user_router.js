const express = require("express");
const router = express.Router();

const userService = require("../service/user_service.js");

router.get("/users", async (req, res) => {
  let result = await userService.findAll();
  res.send(result);
});

router.get("/beneficiaries", async (req, res) => {
  let result = await userService.BeneficiaryList();
  res.send(result);
});

router.get("/beneficiaries/:id", async (req, res) => {
  let target = req.params.id;
  let result = await userService.BeneficiaryDetail(target);
  res.send(result);
});

router.get("/supportPlan/:beneId", async (req, res) => {
  let target = req.params.beneId;
  let result = await userService.SupportPlan(target);
  res.send(result);
});
router.post("/insertSupportPlan", async (req, res) => {
  let target = req.body;
  let result = await userService.InsertSupportPlan(target);
  res.send(result);
});

module.exports = router;
