import db from "../lib/db.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import logger from '../utils/logger.js';
import ApiResponse from '../utils/response.js';

export const deleteCheckin = async (req, res) => {
  try {
    const { userId, dateNow } = req.body;
    if (!userId || !dateNow) {
      return ApiResponse.error(res, 'User ID and date are required', 400, 'error');
    }
    // 1. เช็คว่ามี check-in วันนี้หรือไม่
    const [rows] = await db.query("SELECT * FROM checkins WHERE user_id = ? AND DATE(checkin_date) = ?", [userId, dateNow]);
    if (rows.length === 0) {
      return ApiResponse.error(res, 'No check-in found for today.', 404, 'error');
    }
    // 2. ถ้ามี ให้ลบข้อมูล check-in
    await db.query("DELETE FROM checkins WHERE user_id = ? AND DATE(checkin_date) = ?", [userId, dateNow]);
    // 3. คืนเหรียญ (coins) ที่ได้จากการ check-in
    await db.query("DELETE FROM coins WHERE user_id = ? AND type = 'daily_checkin' AND DATE(created_at) = ?", [userId, dateNow]);
    return ApiResponse.success(res, null, 200, 'Check-in deleted successfully');
  } catch (err) {
    logger.error(`❌ Failed to delete check-in: ${err.message}`);
    return ApiResponse.error(res, 'Server error', 500, 'error');
  }
}
