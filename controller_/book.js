import db from "../lib/db.js"
import constantBook from "../lib/constantBook.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import logger from '../utils/logger.js';
import ApiResponse from '../utils/response.js';
export const addRate = async (req, res) => {
  try {
    const { bookId, userId, rating, comment } = req.body;
    if (!bookId || !userId || !rating) {
      return ApiResponse.error(res, 'Book ID, User ID and Rating are required', 400, 'error');
    }
    const [existing] = await db.query(constantBook.getRatingQuery, [userId, bookId]);

    if (existing.length > 0) {
      // delete existing rating
        await db.query(constantBook.deleteRatingQuery, [userId, bookId]);
    }
    
    await db.query(constantBook.addRatingQuery, [userId, bookId, rating, comment]);
    return ApiResponse.success(res, { message: 'Rating added successfully' }, 200, 'success');
  } catch (err) {
    logger.error(`❌ Failed to add rating: ${err.message}`);
    return ApiResponse.error(res, 'Server error', 500, 'error');
  }
};

export const searchBooks = async (req, res) => {
  try {
    const { category, page = 1, limit = 10, search = "" } = req.query;

    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const offset = (parsedPage - 1) * parsedLimit;

    if (isNaN(parsedLimit) || parsedLimit <= 0 || isNaN(parsedPage) || parsedPage <= 0) {
      return ApiResponse.error(res, "Invalid page or limit parameter", 400, "error");
    }

    let baseQuery = `
      SELECT DISTINCT 
          b.*, 
          (SELECT COUNT(*) FROM ratings r WHERE r.book_id = b.id) AS rating_count,
          (SELECT AVG(rating) FROM ratings r WHERE r.book_id = b.id) AS avg_rating
      FROM books b
      LEFT JOIN book_categories bc ON b.id = bc.book_id
      LEFT JOIN categories c ON bc.category_id = c.id
    `;
    let countQuery = `
      SELECT DISTINCT 
          b.*, 
          (SELECT COUNT(*) FROM ratings r WHERE r.book_id = b.id) AS rating_count,
          (SELECT AVG(rating) FROM ratings r WHERE r.book_id = b.id) AS avg_rating
      FROM books b
      LEFT JOIN book_categories bc ON b.id = bc.book_id
      LEFT JOIN categories c ON bc.category_id = c.id
    `;

    let whereClauses = [];
    let queryParams = [];

    // เพิ่มเงื่อนไขการค้นหา  books เช็คว่า status ต้องเท่ากับ published และ  release_date ต้องมากกว่าหรือเท่ากับวันนี้
    const today = new Date().toISOString().split('T')[0];

    whereClauses.push(`b.status = 'published' AND b.release_date <= ?`);
    queryParams.push(today);

    // ✅ รองรับหลาย category คั่นด้วย comma
    if (category) {
      const categoryList = category.split(",").map(cat => cat.trim());
      const placeholders = categoryList.map(() => `c.name LIKE ?`).join(" OR ");
      whereClauses.push(`(${placeholders})`);
      categoryList.forEach(cat => queryParams.push(`%${cat}%`));
    }

    // ✅ ค้นหาจาก title
    if (search) {
      whereClauses.push(`b.title LIKE ?`);
      queryParams.push(`%${search}%`);
    }

    const whereClause = whereClauses.length > 0 ? ` WHERE ` + whereClauses.join(" AND ") : "";

    // ✅ ดึงจำนวนทั้งหมด
    const [countResult] = await db.query(countQuery + whereClause, queryParams);
    const totalItems = countResult[0]?.total || 0;

    // ✅ ดึงข้อมูลหนังสือ
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
    logger.error(`❌ Failed to search books: ${err.message}`);
    return ApiResponse.error(res, "Server error", 500, "error");
  }
};


export const updateBooks = async (req, res) => {
  try {
    const { bookId, title, userId, description, category, release_date, status } = req.body;

    if (!title || !userId || !description || !category || !release_date || !status) {
      return ApiResponse.error(res, 'Title, User ID, Description, Category, Release Date and Status are required', 400, 'error');
    }

    const booksFile = req.files?.books?.[0];

    if (bookId) {
      // ✏️ กรณีแก้ไขหนังสือ
      let books;

      if (booksFile) {
        books = booksFile.filename;
      } else {
        // ดึงชื่อไฟล์เดิมจากฐานข้อมูล
        const [existing] = await db.query('SELECT cover_image FROM books WHERE id = ?', [bookId]);

        if (existing.length === 0) {
          return ApiResponse.error(res, 'Book not found', 404, 'error');
        }

        books = existing[0].cover_image;
      }
      // อัปเดตหนังสือ category
      await db.query('DELETE FROM book_categories WHERE book_id = ?', [bookId]);
      // Horror,Scifi
      const categoryIds = category.split(',').map(cat => cat.trim());
      for (const catId of categoryIds) {
        // เอาไปหาที่ categories ก่อน เพื่อเอา id ของ category
        const [catResult] = await db.query('SELECT id FROM categories WHERE name = ?', [catId]);
        if (catResult.length === 0) {
          return ApiResponse.error(res, `Category ${catId} not found`, 404, 'error');
        }
        await db.query('INSERT INTO book_categories (book_id, category_id) VALUES (?, ?)', [bookId, catResult[0].id]);
      }
      await db.query(constantBook.updateBookQuery, [title, userId, description, books, release_date, status, bookId]);
      return ApiResponse.success(res, { bookId: bookId }, 200, 'Book updated successfully');
    } else {
      // ➕ กรณีเพิ่มหนังสือใหม่
      const books = booksFile ? booksFile.filename : null;
      let bookDataId = await db.query(constantBook.addBookQuery, [title, userId, description, books, release_date, status]);
      // เพิ่มหนังสือ category
      const categoryIds = category.split(',').map(cat => cat.trim());
      for (const catId of categoryIds) {
        // เอาไปหาที่ categories ก่อน เพื่อเอา id ของ category
        const [catResult] = await db.query('SELECT id FROM categories WHERE name = ?', [catId]);
        if (catResult.length === 0) {
          return ApiResponse.error(res, `Category ${catId} not found`, 404, 'error');
        }
       await db.query('INSERT INTO book_categories (book_id, category_id) VALUES (?, ?)', [bookDataId[0].insertId, catResult[0].id]);
      }
      return ApiResponse.success(res, { bookId: bookDataId[0].insertId }, 201, 'Book added successfully');
    }
  } catch (err) {
    logger.error(`❌ Failed to update book: ${err.message}`);
    return ApiResponse.error(res, 'Server error', 500, 'error');
  }
};

export const getBookMy = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return ApiResponse.error(res, 'User ID is required', 400, 'error');
    }
    const [rows] = await db.query(constantBook.getBooksQuery, [userId]);
    if (rows.length === 0) {
      return ApiResponse.error(res, 'No books found for this user', 404, 'error');
    }
    
    return ApiResponse.success(res, rows, 200, 'Books retrieved successfully');
  } catch (err) {
    logger.error(`❌ Failed to get user books: ${err.message}`);
    return ApiResponse.error(res, 'Server error', 500, 'error');
  }
};

export const updateBookComplete = async (req, res) => {
  try {
    let { bookId, isComplete } = req.body;
    if (!bookId || isComplete === undefined) {
      return ApiResponse.error(res, 'Book ID and completion status are required', 400, 'error');
    }
    if(isComplete == true || isComplete == false) {
      isComplete = isComplete ? 1 : 0; // Convert boolean to integer for
    }
      // database storage
    console.log('Updating book completion status:', bookId, isComplete);
    await db.query(constantBook.updateBookCompleteQuery, [isComplete, bookId]);
    return ApiResponse.success(res, { message: 'Book completion status updated successfully' }, 200, 'success');
  } catch (err) {
    logger.error(`❌ Failed to update book completion status: ${err.message}`);
    return ApiResponse.error(res, 'Server error', 500, 'error');
  }
};

export const searchBooksId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return ApiResponse.error(res, 'Book ID is required', 400, 'error');
    }

    const [rows] = await db.query(constantBook.getBookByIdQuery, [id]);
    if (rows.length === 0) {
      return ApiResponse.error(res, 'Book not found', 404, 'error');
    }
    
    // get category
    const [categoryRows] = await db.query('SELECT c.id, c.name FROM categories c JOIN book_categories bc ON c.id = bc.category_id WHERE bc.book_id = ?', [id]);
    rows[0].categories = categoryRows;

    // get episodes
    const [episodesRows] = await db.query('SELECT * FROM episodes WHERE book_id = ?', [id]);
    rows[0].episodes = episodesRows;
    


    return ApiResponse.success(res, rows[0], 200, 'Book retrieved successfully');
  } catch (err) {
    logger.error(`❌ Failed to search book by ID: ${err.message}`);
    return ApiResponse.error(res, 'Server error', 500, 'error');
  }
};

export const searchBooksIdIsFollowing = async (req, res) => {
  try {
    const { userId, bookId } = req.params;
    if (!userId || !bookId) {
      return ApiResponse.error(res, 'User ID and Book ID are required', 400, 'error');
    }

    const [rows] = await db.query('SELECT COUNT(*) AS isFollowing FROM favorites WHERE user_id = ? AND book_id = ?', [userId, bookId]);
    // add get data ratings is user for book id
    const [rowsRatings] = await db.query('SELECT SUM(rating) AS rating FROM ratings WHERE user_id = ? AND book_id = ?', [userId, bookId]);


    return ApiResponse.success(res, { isFollowing: rows[0].isFollowing > 0, ratings: rowsRatings[0].rating ? rowsRatings[0].rating : 0 }, 200, 'Follow status retrieved successfully');
  } catch (err) {
    logger.error(`❌ Failed to check if user is following book: ${err.message}`);
    return ApiResponse.error(res, 'Server error', 500, 'error');
  }
};