const express = require("express");
const router = express.Router();

const resultService = require("../service/result_service.js");

router.get("/resultList/:beneId", async (req, res) => {
  let target = req.params.beneId;
  let list = await resultService.resultListService(target);
  res.send(list);
});

router.get("/saveResultList/:beneId", async (req, res) => {
  let target = req.params.beneId;
  let list = await resultService.saveResultListService(target);
  res.send(list);
});

router.post("/newResult/", async (req, res) => {
  let target = req.body;
  let result = await resultService.newResultService(target);
  res.send(result);
});

router.get("/supportList/:beneId", async (req, res) => {
  let target = req.params.beneId;
  let list = await resultService.supportListService(target);
  res.send(list);
});

module.exports = router;
