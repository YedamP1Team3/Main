const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

const encodeRFC5987ValueChars = (str) =>
  encodeURIComponent(str).replace(/[!'()*]/g, (c) => {
    return `%${c.charCodeAt(0).toString(16).toUpperCase()}`;
  });

// 💡 파일 다운로드 API
// 호출 경로: /api/download/:filename
router.get("/:filename", (req, res) => {
  const fileName = req.params.filename; // 서버에 저장된 실제 파일명
  const originNameRaw = req.query.originName; // 사용자에게 보여줄 원본 파일명

  // 실제 파일이 위치한 경로 (D:/uploads)
  const filePath = path.join("/root/uploads", fileName);

  // 1. 파일 존재 여부 먼저 확인
  if (!fs.existsSync(filePath)) {
    console.error(`파일 없음: ${filePath}`);
    return res.status(404).send("파일을 찾을 수 없습니다.");
  }

  const originName =
    typeof originNameRaw === "string" && originNameRaw.trim()
      ? originNameRaw
      : "download";
  const asciiFallback =
    originName
      .normalize("NFKD")
      .replace(/[^\x20-\x7E]/g, "")
      .replace(/"/g, "")
      .trim() || "download";

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeRFC5987ValueChars(originName)}`,
  );

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("다운로드 도중 에러 발생:", err);
      if (!res.headersSent) {
        res.status(500).send("서버 에러가 발생했습니다.");
      }
    }
  });
});

module.exports = router;
