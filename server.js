import dotenv from "dotenv"
dotenv.config()

import express from "express"
import morgan from "morgan"
import cors from "cors"
import { readdirSync } from "fs"
import basicAuth from "basic-auth"

import authRoutes from "./routes/auth.js"
import profileRoutes from "./routes/profile.js"
import coinRoutes from "./routes/coin.js"
import purchaseRoutes from "./routes/purchase.js"
import userRoutes from "./routes/user.js"
import bookRoutes from "./routes/book.js"
import episodeRoutes from "./routes/episode.js"
import devRoutes from "./routes/dev.js"

import e from "express"

const app = express()

app.use(morgan("dev"))
app.use(express.json())
app.use(cors())

// 👉 ให้ express เสิร์ฟไฟล์จาก /uploads
app.use("/uploads", express.static("uploads"))

// Static assets (อื่น ๆ)
app.use(express.static("public"))


// Basic Auth middleware
const authMiddleware = (req, res, next) => {
  const user = basicAuth(req)
  const USERNAME = process.env.BASIC_AUTH_USER
  const PASSWORD = process.env.BASIC_AUTH_PASS

  if (!user || user.name !== USERNAME || user.pass !== PASSWORD) {
    res.set("WWW-Authenticate", 'Basic realm="401"')
    return res.status(401).send("Authentication required.")
  }
  next()
}

app.use(authMiddleware)

// routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/coins", coinRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/user", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/episodes", episodeRoutes);
app.use("/api/dev", devRoutes);


// Start server
app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Server is running on port", process.env.PORT || 3000)
})
