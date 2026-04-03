const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploads.js");
const resultService = require("../service/result_service.js");
//지원결과서조회
router.get("/beneficiaries/:beneId/support-result", async (req, res) => {
  let target = req.params.beneId;
  let list = await resultService.getSupportResultList(target);
  res.send(list);
});
//지원결과서 조회(임시)
router.get("/beneficiaries/:beneId/temp", async (req, res) => {
  let target = req.params.beneId;
  let list = await resultService.getSupportResultTempList(target);
  res.send(list);
});
//지원결과서생성
router.post("/support-result", upload.array("files"), async (req, res) => {
  let target = req.body;
  let files = req.files;
  let result = await resultService.createSupportResult(target, files);
  res.send(result);
});
//임시지원결과서생성
router.post("/temp-result", upload.array("files"), async (req, res) => {
  let target = req.body;
  let files = req.files;
  let result = await resultService.createTempResult(target, files);
  res.send(result);
});

//지원결과서 생성에 지원계획서 목록리스트 열기
router.get("/support-plans/approved/:beneId", async (req, res) => {
  let target = req.params.beneId;
  let list = await resultService.getApprovedPlanList(target);
  res.send(list);
});
//지원결과서 상세보기
router.get("/support-result/:resultId", async (req, res) => {
  let target = req.params.resultId;
  let result = await resultService.getSupportDetail(target);
  res.send(result);
});
//지원결과서 파일추가
router.post(
  "/support-result/:resultId/files",
  upload.array("files"),
  async (req, res) => {
    let resultId = req.params.resultId;
    let files = req.files;
    let result = await resultService.addSupportResultFiles(resultId, files);
    res.send(result);
  },
);
//지원결과서 파일삭제
router.delete("/support-result/:resultId/files/:fileId", async (req, res) => {
  let resultId = req.params.resultId;
  let fileId = req.params.fileId;
  let result = await resultService.removeSupportResultFile(resultId, fileId);
  res.send(result);
});
//지원결과서삭제
router.delete("/support-result/:resultId", async (req, res) => {
  let resultNo = req.params.resultId;
  let result = await resultService.removeSupportResult(resultNo);
  res.send(result);
});
//임시지원결과서삭제
router.delete("/temp-result/:resultId", async (req, res) => {
  let resultNo = req.params.resultId;
  let result = await resultService.removeTempResult(resultNo);
  res.send(result);
});
//지원결과서 임시 승인요청 업데이트
router.post("/temp-result/:id/apply", async (req, res) => {
  const { id } = req.params; // result_draft_id
  const { manager_id, bene_id, result_title, result_content, planIds } = req.body;

  const result = await resultService.applySupportResult(
    id,
    { manager_id, bene_id, result_title, result_content },
    planIds
  );
  res.send(result);
});
//지원결과서 임시저장 업데이트
router.put("/support-result/:id/temp", async (req, res) => {
  let { id } = req.params;
  let { result_title, result_content, planIds } = req.body;
  let result = await resultService.updateTempSupportResult(
    id,
    { result_title, result_content },
    planIds,
  );
  res.send(result);
});
//임시지원결과서 임시조회
router.get("/temp-result/:resultId", async (req, res) => {
  let target = req.params.resultId;
  let result = await resultService.getSupportTempDetail(target);
  res.send(result);
});
//임시지원결과서 파일추가
router.post(
  "/temp-result/:resultDraftId/files",
  upload.array("files"),
  async (req, res) => {
    let resultDraftId = req.params.resultDraftId;
    let files = req.files;
    let result = await resultService.addTempResultFiles(resultDraftId, files);
    res.send(result);
  },
);
//임시지원결과서 파일삭제
router.delete("/temp-result/:resultDraftId/files/:fileId", async (req, res) => {
  let resultDraftId = req.params.resultDraftId;
  let fileId = req.params.fileId;
  let result = await resultService.removeTempResultFile(resultDraftId, fileId);
  res.send(result);
});
//반려-임시저장-반려/수정중
router.put("/support-result/:resultId/apply", async (req, res) => {
  let resultNo = req.params.resultId; // URL에서 ID 추출
  let target = req.body;            // 수정된 title, content, planIds 포함
  let result = await resultService.resubmitSupportResult(resultNo, target);
  res.send(result);
});

router.put("/support-result/:resultId/save", async (req, res) => {
  let resultNo = req.params.resultId; // URL에서 ID 추출
  let target = req.body;            // 수정된 title, content, planIds 포함
  let result = await resultService.rejectSupportResult(resultNo, target);
  res.send(result);
});

module.exports = router;
