const express = require("express");
const router = express.Router();
const surveyService = require("../service/surveyService");

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

router.get("/versions", async (req, res) => {
  try {
    const versions = await surveyService.getSurveyVersions();

    // 프론트의 기존 system admin 화면은 versions 배열 안에서
    // VERSION_ID / IS_ACTIVE / CREATE_DATE 키를 직접 읽고 있다.
    // 백엔드 내부는 lower-case 규칙으로 정리하되,
    // 화면 호환을 위해 legacy 키만 추가해서 내려준다.
    const legacyVersions = versions.map((version) => ({
      ...version,
      VERSION_ID: version.version_id,
      IS_ACTIVE: version.is_active,
      CREATE_DATE: version.create_date,
    }));

    sendSuccess(res, versions, { versions: legacyVersions });
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await surveyService.getSurveyStructure(req.query.versionId);
    sendSuccess(res, result, result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/item", async (req, res) => {
  try {
    const result = await surveyService.itemAdd(req.body);
    sendSuccess(res, result, { item: result });
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/item/sub", async (req, res) => {
  try {
    const result = await surveyService.subItemAdd(req.body);
    sendSuccess(res, result, { item: result });
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/details", async (req, res) => {
  try {
    const result = await surveyService.registerDetail(req.body);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
});

router.delete("/delete-selected", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      const error = new Error("삭제할 id가 없습니다.");
      error.status = 400;
      throw error;
    }

    const itemIds = [];
    const subIds = [];
    const detailIds = [];

    ids.forEach((rawId) => {
      const [type, id] = rawId.split("-");

      if (type === "item") itemIds.push(id);
      if (type === "sub") subIds.push(id);
      if (type === "detail") detailIds.push(id);
    });

    const result = await surveyService.deleteSelected(itemIds, subIds, detailIds);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/version/new", async (req, res) => {
  try {
    const result = await surveyService.makeNewSurveyVersion(req.body.versionId);
    sendSuccess(res, result, { newVersionId: result });
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/active_survey", async (req, res) => {
  try {
    const result = await surveyService.getActiveSurvey();
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/submit", async (req, res) => {
  try {
    const result = await surveyService.submitSurveyResult(req.body);
    sendSuccess(res, result, { app_id: result });
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/result/:appId", async (req, res) => {
  try {
    const result = await surveyService.getApplicationDetail(req.params.appId);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/list/:beneId", async (req, res) => {
  try {
    const result = await surveyService.getApplicationListByBene(req.params.beneId);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
});

router.delete("/application/:appId", async (req, res) => {
  try {
    const result = await surveyService.deleteSurveyApplication(req.params.appId);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
});

module.exports = router;
