import db from "../lib/db.js"
import constantCoins from "../lib/constantCoins.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import logger from '../utils/logger.js';
import ApiResponse from '../utils/response.js';

export const checkin = async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return ApiResponse.error(res, 'User ID is required', 400, 'error');
    }

    // 1. เช็คว่ามี check-in วันนี้หรือยัง
    const [rows] = await db.query(constantCoins.checkDataCheckins, [userId]);
    if (rows[0].count > 0) {
      return ApiResponse.error(res, 'You have already checked in today.', 400, 'error');
    }

    // 2. ถ้ายังไม่เคย check-in วันนี้ ให้ insert ข้อมูล check-in
    const resCheckins  = await db.query(constantCoins.addDataCheckins, [userId]);
    
    let Coins = 1;
    let type = 'daily_checkin';
    // 3. เพิ่มเหรียญ (coins) ให้ user
    await db.query( constantCoins.addCoins, [userId, Coins, type] );

    return ApiResponse.success(res, null, 200, 'Check-in successful');
  } catch (err) {
    logger.error(`❌ Failed to check in: ${err.message}`);
    return ApiResponse.error(res, 'Server error', 500, 'error');
  }
};

export const addCoins = async (req, res) => {
    try {
        const { userId, amount, type } = req.body;
        if (!userId || !amount) {
            return ApiResponse.error(res, 'User ID and amount are required', 400, 'error');
        }
        let setDataType = type || 'earn'; // Default type if not provided

        if(setDataType == 'spend' ){
          const [rows] = await db.query(constantCoins.getTransactionHistory, [userId]);
          const totalCoins = rows.reduce((acc, transaction) => acc + transaction.amount, 0);
          if (totalCoins < amount) {
            return ApiResponse.error(res, 'Insufficient coins', 400, 'error');
          }
        }
        // Logic for adding coins
        await db.query(constantCoins.addCoins, [userId, amount, setDataType]);
        return ApiResponse.success(res, null, 200, 'Coins added successfully');
    } catch (err) {
        logger.error(`❌ Failed to add coins: ${err.message}`);
        return ApiResponse.error(res, 'Server error', 500, 'error');
    }
};

export const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!userId) {
            return ApiResponse.error(res, 'User ID is required', 400, 'error');
        }
        // Logic for fetching transaction history
        const [transactions] = await db.query(constantCoins.getTransactionHistory, [userId]);
        const totalCoins = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
        return ApiResponse.success(res, { transactions, totalCoins }, 200, 'Transaction history retrieved successfully');
    } catch (err) {
        logger.error(`❌ Failed to get transaction history: ${err.message}`);
        return ApiResponse.error(res, 'Server error', 500, 'error');
    }
};