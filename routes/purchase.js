import express from "express"
const router = express.Router()
import { purchasesEpisode} from "../controller/purchase.js"

router.post("/", purchasesEpisode);

export default router;