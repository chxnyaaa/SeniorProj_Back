import express from "express"
const router = express.Router()
import { checkin, addCoins, getTransactionHistory } from "../controller/coin.js"
router.post("/checkin", checkin);
router.post("/", addCoins);
router.get("/:id", getTransactionHistory);

export default router;