const express = require("express");
const router = express.Router();
const service = require("../service/adapphistory_service.js");

router.get("/join-requests/family", async (req, res) => {
  try {
    const result = await service.fetchJoinRequests();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

router.post("/active/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await service.activeUser(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

router.delete("/delete/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await service.removeUser(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

module.exports = router;
