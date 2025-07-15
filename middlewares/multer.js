import multer from "multer";
import path from "path";
import fs from "fs";

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
 
    if (url.includes("/product")) {
      destFolder = "book_covers";
    } else if (url.includes("/episode")) {
        if (file.fieldname === "audio") {
          destFolder = "episode_audio";
        } else if (file.fieldname === "file") {
          destFolder = "episode_documents"; // เก็บ PDF
        } else {
          destFolder = "episode_images";
        }
    }

    const uploadPath = path.join(rootUploadDir, destFolder);
    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const userId = req.body.author_id || req.body.user_id || "unknown";
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
