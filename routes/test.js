import express from "express"
const router = express.Router()

router.get("/test", (req, res) => {
  res.status(200).json({
    message: "Test route is working test",
    timestamp: new Date().toISOString()
  })
})

export default router