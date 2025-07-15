import dotenv from "dotenv"
dotenv.config()

import express from "express"
import morgan from "morgan"
import cors from "cors"
import { readdirSync } from "fs"
import basicAuth from "basic-auth"

import authRoutes from "./routes/auth.js"
import productRoutes from "./routes/product.js"
import loginRoutes from "./routes/login.js"
import profileRoutes from "./routes/profile.js"
import episodeRoutes from "./routes/episode.js"
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

// Routes
app.use("/signup", authRoutes)
app.use("/login", loginRoutes)
app.use("/profile", profileRoutes)
app.use("/product", productRoutes)
app.use("/episode", episodeRoutes)


// Start server
app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Server is running on port", process.env.PORT || 3000)
})
