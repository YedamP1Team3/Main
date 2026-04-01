const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = "d:/uploads";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // 파일명 중복을 방지하기 위해 [현재시간-원본파일명]으로 저장합니다.
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB 제한
});

module.exports = upload;
