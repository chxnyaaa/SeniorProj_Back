import express from "express"
const router = express.Router()

import { getProduct
        , getProductID
        , searchProduct
        , CreateProduct
        , UpdateProduct
        , UpdateIsComplete
        , UpdateFollowers
    } from "../controller/product.js"
import { upload } from "../middlewares/multer.js" // 👈 import multer middleware

router.get("/", getProduct)
router.get("/:count", getProductID)
router.post("/search", searchProduct)

// ⬇️ เพิ่ม upload.single("cover") เพื่อรับรูป
router.post("/", upload.single("cover"), CreateProduct)
router.put("/:id", upload.single("cover"), UpdateProduct)
router.put("/:id/status", UpdateIsComplete)
router.post("/follow", UpdateFollowers)

export default router
