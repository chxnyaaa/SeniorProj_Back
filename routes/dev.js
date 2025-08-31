import express from "express"
const router = express.Router()
import { deleteCheckin } from "../controller/dev.js"
router.post("/deleteCheckin", deleteCheckin);

export default router;