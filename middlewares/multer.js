import multer from "multer";
import path from "path";
import fs from "fs";
import e from "express";

const rootUploadDir = path.resolve(process.cwd(), "uploads");

// ช่วยสร้างโฟลเดอร์ถ้ายังไม่มี
function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// กำหนด path เก็บไฟล์ตามเส้นทาง API
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let destFolder = "others"; // fallback

    const url = req.originalUrl;
    if (url.includes("/api/profile")) {
      destFolder = "avatar";
    }else if (url.includes("/api/books")) {
      destFolder = "books";
    }else if (url.includes("/api/episodes")) {
      destFolder = "cover";
    }

    const uploadPath = path.join(rootUploadDir, destFolder);
    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const EpisodeId = req.params.EpisodeId;
    const userId = req.body.userId  || EpisodeId || "unknown";
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "");
    const ext = path.extname(file.originalname);
    const filename = `${userId}_${timestamp}${ext}`;
    cb(null, filename);
  }
});

// รองรับ .jpg, .png, .mp3
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "audio/mpeg", "audio/mp3", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, MP3, and PDF files are allowed"));
  }
};

export const upload = multer({ storage, fileFilter });
