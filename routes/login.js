import express from "express"
const router = express.Router()
import { 
    login 
    , forgotPassword
    , resetPassword
} from "../controller/auth.js"

router.post("/", login)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)
 
export default router