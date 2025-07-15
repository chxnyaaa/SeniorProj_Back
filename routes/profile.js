import express from "express"
const router = express.Router()
import { 
     updateUserProfile
     , updatePenName
} from "../controller/auth.js"

router.post("/update-profile", updateUserProfile)
router.post("/pen-name", updatePenName)
export default router