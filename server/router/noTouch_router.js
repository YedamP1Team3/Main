const express = require("express");
const router = express.Router();
const noTouchService = require("../service/noTouch_service");

const sendSuccess = (res, data, legacy = {}) => {
  res.status(200).json({
    success: true,
    data,
    ...legacy,
  });
};

const sendError = (res, error) => {
  res.status(error.status || 500).json({
    success: false,
    message: error.message,
  });
};

router.get("/bene", async (req, res) => {
  try {
    const result = await noTouchService.BeneList(req.query.user_id);
    sendSuccess(res, result, { list: result });
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/bene/:id", async (req, res) => {
  try {
    const result = await noTouchService.BeneDetail(req.params.id);

    // 이 엔드포인트는 기존 프론트가 res.data.manager_name 같은 형태로도 읽는다.
    // 그래서 표준 응답을 유지하면서, detail 필드를 top-level 에도 펼쳐서
    // 프론트를 수정하지 않아도 화면이 깨지지 않게 한다.
    sendSuccess(res, result, result || {});
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/managers", async (req, res) => {
  try {
    const result = await noTouchService.getManagerList();
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
});

router.put("/assign-manager", async (req, res) => {
  try {
    const result = await noTouchService.assignManagerToBene(
      req.body.bene_id,
      req.body.manager_id,
      req.body.admin_id,
    );

    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/assign-manager/history/:bene_id", async (req, res) => {
  try {
    const result = await noTouchService.getManagerAssignHistory(
      req.params.bene_id,
    );
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/priority/:bene_id", async (req, res) => {
  try {
    const result = await noTouchService.getPriority(req.params.bene_id);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/priority/request", async (req, res) => {
  try {
    const result = await noTouchService.requestPriority(
      req.body.bene_id,
      req.body.priority_status,
    );

    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/priority/cancel", async (req, res) => {
  try {
    const result = await noTouchService.cancelPriority(req.body.bene_id);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/admin/priority/approve", async (req, res) => {
  try {
    const result = await noTouchService.adminApprovePriority(req.body.bene_id);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/admin/priority/reject", async (req, res) => {
  try {
    const result = await noTouchService.adminRejectPriority(
      req.body.bene_id,
      req.body.reason,
    );

    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/admin/priority/reject-history/:bene_id", async (req, res) => {
  try {
    const result = await noTouchService.getAdminRejectHistory(req.params.bene_id);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
});

module.exports = router;
