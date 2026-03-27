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

router.get("/detailResultPlan/:resultId", async (req, res) => {
  let target = req.params.resultId;
  let result = await resultService.detailSupportResultService(target);
  res.send(result);
});

router.delete("/supportResult/:resultId", async (req, res) => {
  let resultNo = req.params.resultId;
  let result = await resultService.supportResultService(resultNo);
  res.send(result);
});

router.put("/supportResult/update/:id", async (req, res) => {
  let { id } = req.params;
  let { result_title, result_content, planIds } = req.body;
  let result = await resultService.updateSupportResultService(
    id,
    { result_title, result_content },
    planIds,
  );
  res.send(result);
});

router.put("/saveResult/update/:id", async (req, res) => {
  let { id } = req.params;
  let { result_title, result_content, planIds } = req.body;
  let result = await resultService.updateSaveSaveService(
    id,
    { result_title, result_content },
    planIds,
  );
  res.send(result);
});

module.exports = router;
