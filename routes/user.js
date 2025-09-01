import express from "express"
const router = express.Router()
import { 
     getTransactionBookHistoryPurchase
     , getTransactionEpisodeHistoryPurchase
     , updateFavorites
     , getUserFavorites
     , getUserHistory
     , addUserUpdateHistory
} from "../controller/user.js"

router.post("/book", getTransactionBookHistoryPurchase);
router.post("/episode-history", getTransactionEpisodeHistoryPurchase);
router.post("/favorites", updateFavorites);
router.get("/", getUserFavorites)
router.post("/history", getUserHistory)
router.post("/update-history", addUserUpdateHistory)
export default router