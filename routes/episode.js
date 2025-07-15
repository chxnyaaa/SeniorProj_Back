import express from "express"
const router = express.Router()

import { getEpisodeProduct
        , getEpisodeID
        , CreateEpisode
        , UpdateEpisode
    } from "../controller/episode.js"
import { upload } from "../middlewares/multer.js" // 👈 import multer middleware

router.get("/:product", getEpisodeProduct)
router.get("/:product/:count", getEpisodeID)

router.post("/", upload.fields([
  { name: "cover", maxCount: 1 },
  { name: "audio", maxCount: 1 },
  { name: "file", maxCount: 1 } // PDF
]), CreateEpisode)

router.put("/:id", upload.fields([
  { name: "cover", maxCount: 1 },
  { name: "audio", maxCount: 1 },
  { name: "file", maxCount: 1 } // PDF
]), UpdateEpisode)


export default router
