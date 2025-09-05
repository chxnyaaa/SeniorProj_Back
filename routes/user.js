import express from "express"
const router = express.Router()
import { 
     getTransactionBookHistoryPurchase
     , getTransactionEpisodeHistoryPurchase
     , updateFavorites
     , getUserFavorites
     , getUserHistory
     , addUserUpdateHistory
     , getTransactionBookPurchase
     , getAudio
     , getUserNotification
     , activeUserNotification
} from "../controller/user.js"

router.post("/book", getTransactionBookHistoryPurchase);
router.post("/episode-history", getTransactionEpisodeHistoryPurchase);
router.post("/favorites", updateFavorites);
router.get("/", getUserFavorites)
router.post("/history", getUserHistory)
router.post("/update-history", addUserUpdateHistory)

router.post("/get-data-purchases-all", getTransactionBookPurchase);

router.post("/audio", getAudio);
router.post("/get_notification", getUserNotification);
router.post("/active_notification", activeUserNotification);

export default router