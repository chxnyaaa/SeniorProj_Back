import db from "../lib/db.js"
import constantUser from "../lib/constantUser.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import logger from '../utils/logger.js';
import ApiResponse from '../utils/response.js';

export const getTransactionBookHistoryPurchase = async (req, res) => {
  try {
    const { userId} = req.body;
    if (!userId) {
      return ApiResponse.error(res, 'User ID is required', 400, 'error');
    }
    const [rows] = await db.query(constantUser.getTransactionBookHistory, [userId]);
    if (rows.length === 0) {
      return ApiResponse.error(res, 'No purchase history found', 404, 'error');
    }
    return ApiResponse.success(res, rows, 200, 'Purchase history retrieved successfully');
  } catch (err) {
    logger.error(`❌ Failed to get book purchase history: ${err.message}`);
    return ApiResponse.error(res, 'Server error', 500, 'error');
  }
}

export const getTransactionEpisodeHistoryPurchase = async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    if (!userId || !bookId) {
      return ApiResponse.error(res, 'User ID and Book ID are required', 400, 'error');
    }
    const [rows] = await db.query(constantUser.getTransactionEpisodeHistory, [userId, bookId]);
    if (rows.length === 0) {
      return ApiResponse.error(res, 'No episode purchase history found', 404, 'error');
    }
    return ApiResponse.success(res, rows, 200, 'Episode purchase history retrieved successfully');
  } catch (err) {
    logger.error(`❌ Failed to get episode purchase history: ${err.message}`);
    return ApiResponse.error(res, 'Server error', 500, 'error');
  }
}

export const updateFavorites = async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    if (!userId || !bookId) {
      return ApiResponse.error(res, 'User ID and Book ID are required', 400, 'error');
    }
    
    // Check if the book is already in favorites
    const [existing] = await db.query(constantUser.getFavoritesQuery, [userId, bookId]);
    
    if (existing.length > 0) {
      await db.query(constantUser.deleteFavoriteQuery, [userId, bookId]);
      return ApiResponse.success(res, { message: 'Book removed from favorites' }, 200, 'success');
    } else {
      await db.query(constantUser.addFavoriteQuery, [userId, bookId]);
      return ApiResponse.success(res, { message: 'Book added to favorites' }, 200, 'success');
    }
  } catch (err) {
    logger.error(`❌ Failed to update favorites: ${err.message}`);
    return ApiResponse.error(res, 'Server error', 500, 'error');
  }
}


export const getUserFavorites = async (req, res) => {
  try {
    const { category, page = 1, limit = 10, search = "", userId } = req.query;

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    if (!userId) {
      return ApiResponse.error(res, "User ID is required", 400, "error");
    }

    if (isNaN(parsedLimit) || parsedLimit <= 0 || isNaN(parsedPage) || parsedPage <= 0) {
      return ApiResponse.error(res, "Invalid page or limit parameter", 400, "error");
    }

    // ✅ Base query
    let baseQuery = `
      SELECT DISTINCT 
          b.*, 
          (SELECT COUNT(*) FROM ratings r WHERE r.book_id = b.id) AS rating_count,
          (SELECT AVG(rating) FROM ratings r WHERE r.book_id = b.id) AS avg_rating
      FROM books b
      INNER JOIN favorites f ON b.id = f.book_id
      LEFT JOIN book_categories bc ON b.id = bc.book_id
      LEFT JOIN categories c ON bc.category_id = c.id
    `;

    let countQuery = `
      SELECT COUNT(DISTINCT b.id) AS total
      FROM books b
      INNER JOIN favorites f ON b.id = f.book_id
      LEFT JOIN book_categories bc ON b.id = bc.book_id
      LEFT JOIN categories c ON bc.category_id = c.id
    `;

    // ✅ Conditions
    let whereClauses = [`f.user_id = ?`];
    let queryParams = [userId];

    if (category) {
      const categoryList = category.split(",").map(cat => cat.trim());
      const placeholders = categoryList.map(() => `c.name LIKE ?`).join(" OR ");
      whereClauses.push(`(${placeholders})`);
      categoryList.forEach(cat => queryParams.push(`%${cat}%`));
    }

    if (search) {
      whereClauses.push(`b.title LIKE ?`);
      queryParams.push(`%${search}%`);
    }

    const whereClause = ` WHERE ${whereClauses.join(" AND ")}`;

    // ✅ Count total
    const [countResult] = await db.query(countQuery + whereClause, queryParams);
    const totalItems = countResult[0]?.total || 0;

    // ✅ Fetch books
    const [books] = await db.query(
      `${baseQuery}${whereClause} ORDER BY b.created_at DESC LIMIT ? OFFSET ?`,
      [...queryParams, parsedLimit, offset]
    );

    const response = {
      data: books,
      pagination: {
        current_page: parsedPage,
        total_pages: Math.ceil(totalItems / parsedLimit),
        total_items: totalItems,
      },
    };

    return ApiResponse.success(res, response, 200, "Books fetched successfully");
  } catch (err) {
    logger.error(`❌ Failed to fetch user favorites: ${err.message}`);
    return ApiResponse.error(res, "Server error", 500, "error");
  }
};

