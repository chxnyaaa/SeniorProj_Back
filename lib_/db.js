import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const db = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE_NAME,
  port: process.env.DATABASE_PORT || 4000, // fallback ถ้ายังไม่ตั้ง
  ssl: {
    rejectUnauthorized: true // เทียบเท่า VERIFY_IDENTITY
  }
});

// test connection
db.getConnection()
  .then((conn) => {
    console.log("Database connected");
    conn.release();
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

export default db;
