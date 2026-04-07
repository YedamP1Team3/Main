const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = "/root/uploads";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const normalizedOriginalName = (() => {
      if (!file?.originalname) return "file";
      const hasNonLatin1CodePoint = Array.from(file.originalname).some(
        (ch) => ch.codePointAt(0) > 255,
      );
      const decodedName = hasNonLatin1CodePoint
        ? file.originalname
        : Buffer.from(file.originalname, "latin1").toString("utf8");

      const baseName = path.basename(decodedName);
      file.originalname = baseName;
      return baseName || "file";
    })();

    const uniqueSuffix = `${Date.now()}-${normalizedOriginalName}`;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB 제한
});

module.exports = upload;
