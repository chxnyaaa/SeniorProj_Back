import express from "express"
const router = express.Router()
import { purchasesEpisode, buyBookEpisodesAll} from "../controller/purchase.js"

router.post("/", purchasesEpisode);
router.post("/buy-book-episodes-all", buyBookEpisodesAll);

export default router;