import express from "express"
const router = express.Router()

import { addRate
        , searchBooks
        , updateBooks
        , getBookMy
        , updateBookComplete
        , searchBooksId
        , searchBooksIdIsFollowing
    } from "../controller/book.js"
import { upload } from "../middlewares/multer.js" // 👈 import multer middleware

router.post("/rate", addRate)
router.get("/", searchBooks)
router.post('/', upload.fields([{ name: 'books', maxCount: 1 }]), updateBooks)
router.post("/book-My", getBookMy)
router.post("/is_complete", updateBookComplete)
router.get("/:id", searchBooksId)
router.get("/following/:userId/:bookId", searchBooksIdIsFollowing)

export default router
