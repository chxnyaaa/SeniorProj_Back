import express from "express"
const router = express.Router()
import { 
    signup
} from "../controller/auth.js"

router.post("/", signup)
 
export default router