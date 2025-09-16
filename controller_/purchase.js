import db from "../lib/db.js"
import constantPurchase from "../lib/constantPurchase.js"
import constantCoins from "../lib/constantCoins.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import logger from '../utils/logger.js';
import ApiResponse from '../utils/response.js';


export const purchasesEpisode = async (req, res) => {
  try {
    const { userId, bookId, episodeId, amount } = req.body;
    if (!userId || !bookId || !episodeId || !amount) {
      return ApiResponse.error(res, 'User ID, Book ID, Episode ID and amount are required', 400, 'error');
    }
    const [rows] = await db.query(constantCoins.getTransactionHistory, [userId]);
    const totalCoins = rows.reduce((acc, transaction) => acc + transaction.amount, 0);
    if (totalCoins < amount) {
      return ApiResponse.error(res, 'Insufficient coins', 400, 'error');
    }

    //เช็คก่อนว่าซื้อไปแล้วหรือยัง
    const [purchaseRows] = await db.query(constantPurchase.checkPurchase, [userId, bookId, episodeId]);
    if (purchaseRows.length > 0) {
      return ApiResponse.error(res, 'Episode already purchased', 400, 'error');
    }

    let getEpisodesQuery = `SELECT 
                    a.price, 
                    a.title AS title_episode,
                    b.title AS title_book
                FROM episodes a
                LEFT JOIN books b
                    ON a.book_id = b.id
                WHERE a.id = ?
                  AND a.book_id = ?`;
      const [episodeRows] = await db.query(getEpisodesQuery, [episodeId, bookId]);

      if (episodeRows.length === 0) {
        return ApiResponse.error(res, `Episode ${episodeId} not found`, 404, 'error');
      }

      let title_episode = episodeRows[0].title_episode;
      let title_book = episodeRows[0].title_book;

    // add coins transaction
    // await db.query(constantCoins.addCoinsEpisode, [userId, -amount, 'spend', `Purchased episode ${episodeId} of book ${bookId}`]);
    await db.query(constantCoins.addCoinsEpisode, [userId, -amount, 'spend', `Purchased ${title_book}: ${title_episode}`]);
    // Insert purchase record
    await db.query(constantPurchase.addPurchase, [userId, bookId, episodeId, amount]);
    return ApiResponse.success(res, null, 200, 'Purchase successful');


  } catch (err) {
    logger.error(`❌ Failed to purchase episode: ${err.message}`);
    return ApiResponse.error(res, 'Server error', 500, 'error');
  }
}
export const buyBookEpisodesAll = async (req, res) => {
  try {
    const { userId, bookId, listEpisodes, totalPrice } = req.body;
    if (!userId || !bookId || !listEpisodes || !totalPrice) {
      return ApiResponse.error(res, 'User ID, Book ID, Book ID and amount are required', 400, 'error');
    }

    const [rows] = await db.query(constantCoins.getTransactionHistory, [userId]);
    const totalCoins = rows.reduce((acc, transaction) => acc + transaction.amount, 0);
    if (totalCoins < totalPrice) {
      return ApiResponse.error(res, 'Insufficient coins', 400, 'error');
    }

    let values = [];

    for (const episodeId of listEpisodes) {
      let getEpisodesQuery = `SELECT 
                    a.price, 
                    a.title AS title_episode,
                    b.title AS title_book
                FROM episodes a
                LEFT JOIN books b
                    ON a.book_id = b.id
                WHERE a.id = ?
                  AND a.book_id = ?`;
      const [episodeRows] = await db.query(getEpisodesQuery, [episodeId, bookId]);

      if (episodeRows.length === 0) {
        return ApiResponse.error(res, `Episode ${episodeId} not found`, 404, 'error');
      }

      let totalCoins = episodeRows[0].price;
      let title_episode = episodeRows[0].title_episode;
      let title_book = episodeRows[0].title_book;
      values.push([userId, bookId, episodeId, totalCoins]);

      // add coins transaction
      await db.query(constantCoins.addCoinsEpisode, [userId, -totalCoins, 'spend', `Purchased ${title_book}: ${title_episode}`]);
    }

    if (values.length === 0) {
      return ApiResponse.error(res, 'No episodes to purchase', 400, 'error');
    }

    const query = `INSERT INTO purchases (user_id, book_id, episode_id, amount) VALUES ?`;
    await db.query(query, [values]);

    return ApiResponse.success(res, null, 200, 'Purchase all episodes successful');
  } catch (err) {
    logger.error(`❌ Failed to purchase all episodes of the book: ${err.message}`);
    return ApiResponse.error(res, 'Server error', 500, 'error');
  }
};
