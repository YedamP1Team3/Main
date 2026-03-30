const express = require("express");
const router = express.Router();
const service = require("../service/mgtargets_service");

router.get("/list/:userId", async (req, res) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page) || 1;

  try {
    const result = await service.getManageListData(userId, page);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "데이터를 불러오는 중 오류 발생",
    });
  }
});

module.exports = router;
