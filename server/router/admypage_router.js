const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const service = require("../service/admypage_service.js");

router.get("/:id", async (req, res) => {
  try {
    const result = await service.findAdminById(req.params.id);
    if (result) {
      res.json(result); // 성공 시 JSON 데이터 응답
    } else {
      res.status(404).send({ message: "관리자 정보를 찾을 수 없습니다" });
    }
  } catch (err) {
    console.error("Router 에러:", err);
    res.status(500).send({ message: "서버 오류 발생" });
  }
});

router.put("/update", async (req, res) => {
  const data = req.body;
  try {
    const user = await service.checkPassword(data.user_id);
    console.log("DB에서 가져온 비밀번호:", user.password);
    console.log("프론트에서 보낸 비밀번호:", data.currentPassword);

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);

    if (!user || !isMatch) {
      return res.json({
        success: false,
        message: "현재 비밀번호가 일치하지 않습니다.",
      });
    }

    await service.modifyAdmin(data);

    if (data.newPassword) {
      await service.modifyPassword(data.user_id, data.newPassword);
    }

    res.json({ success: true, message: "수정 완료!" });
  } catch (err) {
    console.error("Update Router 에러:", err);
    res.status(500).json({ success: false, message: "서버 저장 중 오류 발생" });
  }
});

module.exports = router;
