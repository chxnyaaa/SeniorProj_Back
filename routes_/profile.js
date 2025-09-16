import express from "express"
const router = express.Router()
import { setPenName, updateProfile, getUserProfile } from "../controller/profile.js"
import { upload } from "../middlewares/multer.js" // 👈 import multer middleware
router.post("/penName", setPenName);
router.post('/', upload.fields([{ name: 'avatar', maxCount: 1 }]), updateProfile);
router.get("/:id", getUserProfile);

export default router;