import mysql from "mysql2/promise"
import dotenv from "dotenv";
dotenv.config();

const db = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE_NAME,
  port: process.env.DATABASE_PORT || 3306, // fallback ถ้ายังไม่ตั้ง
});




// test connection
db.getConnection()
  .then((conn) => {
    console.log("Database connected");
    conn.release();
  })
  .catch((err) => {
    console.log("Database connection failed");
    console.log(err);
  });

export default db;