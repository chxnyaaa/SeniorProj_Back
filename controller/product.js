import db from "../lib/db.js";
import constantBook  from "../lib/constant_book.js";
import constantEpisode from "../lib/constant_episode.js";
import logger from '../utils/logger.js';
import e from "express";


export const CreateProduct = async (req, res) => {
  try {
    const file = req.file;
    const cover_url = file ? `/uploads/book_covers/${file.filename}` : null;

    let {
      title,
      description,
      category,
      author_id,
      price_per_chapter,
      release_date,
      status,
      is_complete
    } = req.body;

    if (!title || !description || !author_id || !release_date) {
      let set_res = {
        statusCode: 404,
        message: "User not found",
        data: null
      };
      logger.error("❌ Title, description, author ID, and release date are required");
      return res.status(400).json(set_res);
    }

    status = status || 'draft';
    is_complete = is_complete ? Boolean(is_complete) : false; // Default to false if not provided

    const [product] = await db.query(constantBook.CreateProduct, [
      title,
      description,
      cover_url,
      category,
      author_id,
      price_per_chapter,
      release_date,
      status,
      is_complete
    ]);

    if (product.affectedRows === 0) {

      let set_res = {
        statusCode: 500,
        message: "Failed to create product",
        data: null
      };
      logger.error(`❌ Failed to create book "${title}" by author_id ${author_id}`);
      return res.status(404).json(set_res);

    }


    let set_res = {
      statusCode: 200,
      message: "Product created successfully",
      data: {
        id: product.insertId,
        cover_url
      }
    };
    logger.info(`✅ Book "${title}" created successfully by author_id ${author_id}`);
    return res.status(201).json(set_res);

  } catch (err) {
    let set_res = {
      statusCode: 500,
      message: "Server error",
      data: err.message
    };
    logger.error(`❌ Failed to create book: ${err.message}`);
    return res.status(500).json(set_res);
  }
};

export const UpdateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      title,
      description,
      category,
      author_id,
      price_per_chapter,
      release_date,
      status,
      is_complete
    } = req.body;

    // ถ้ามีไฟล์ใหม่
    const file = req.file;
    const cover_url = file ? `/uploads/book_covers/${file.filename}` : null;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!title || !description || !author_id || !price_per_chapter || !release_date) {
      let set_res = {
        statusCode: 400,
        message: "Missing required fields",
        data: null
      };
      logger.error("❌ Missing required fields for updating product");
      return res.status(400).json(set_res);
    }

    const params = [
      title,
      description,
      cover_url,    // ส่ง null ถ้าไม่มีไฟล์ใหม่
      category,
      author_id,
      price_per_chapter,
      release_date,
      status,
      is_complete,
      productId,
    ];

    const [result] = await db.query(constantBook.UpdateProduct, params);

    if (result.affectedRows === 0) {
      let set_res = {
        statusCode: 404,
        message: "Product not found or no changes made",
        data: null
      };
      logger.error(`❌ Failed to update product ID ${productId}: ${set_res.message}`);
      return res.status(404).json(set_res);
    }


    let set_res = {
      statusCode: 200,
      message: "Product updated successfully",
      data: {
        id: productId,
        cover_url: cover_url || null // ส่ง null ถ้าไม่มีไฟล์ใหม่
      }
    };
    logger.info(`✅ Product ID ${productId} updated successfully`);
    return res.status(200).json(set_res);

  } catch (error) {
    let set_res = {
      statusCode: 500,
      message: "Server error",
      data: error.message
    };
    logger.error(`❌ Failed to update product ID ${req.params.id}: ${error.message}`);
    return res.status(500).json(set_res);
  }
};

export const getProductID = async (req, res) => {
  try {
    const { count } = req.params;
    if (!count || isNaN(count)) {
      return res.status(400).json({ message: "Invalid count parameter" });
    }
    const [products] = await db.query(constantBook.getProductID, [parseInt(count)]);
    const [episodes] = await db.query(constantEpisode.GetEpisodesByBookId, [parseInt(count)]);

    let set_res = {
      statusCode: 200,
      message: "Product fetched successfully",
      data: {
        product: products?.[0] || null,
        episodes: episodes || [],
        count_following: episodes.length
      }
    };

    res.status(200).json(set_res);
  } catch (err) {
    let set_res = {
      statusCode: 500,
      message: "Server error",
      data: err.message
    };
    logger.error(`❌ Failed to fetch product by ID: ${err.message}`);
    return res.status(500).json(set_res);
  }
};

export const getProduct = async (req, res) => {
  try {
    const { category, page = 1, limit = 10, search = "" } = req.query; // เพิ่ม search

    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const offset = (parsedPage - 1) * parsedLimit;

    if (isNaN(parsedLimit) || parsedLimit <= 0 || isNaN(parsedPage) || parsedPage <= 0) {
      return res.status(400).json({
        statusCode: 400,
        message: "Invalid page or limit parameter",
        data: null,
      });
    }

    let baseQuery = `SELECT * FROM books`;
    let countQuery = `SELECT COUNT(*) as total FROM books`;
    let whereClauses = [];
    let queryParams = [];

    if (category) {
      whereClauses.push(`category LIKE ?`);
      queryParams.push(`%${category}%`);
    }

    if (search) {
      whereClauses.push(`title LIKE ?`);  // สมมติว่าค้นหาจากฟิลด์ title
      queryParams.push(`%${search}%`);
    }

    const whereClause = whereClauses.length > 0 ? ` WHERE ` + whereClauses.join(" AND ") : "";

    // Count total items
    const [countResult] = await db.query(countQuery + whereClause, queryParams);
    const totalItems = countResult[0]?.total || 0;

    // Fetch books with limit and offset
    const [products] = await db.query(
      `${baseQuery}${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...queryParams, parsedLimit, offset]
    );

    const response = {
      statusCode: 200,
      message: "Products fetched successfully",
      data: products,
      pagination: {
        current_page: parsedPage,
        total_pages: Math.ceil(totalItems / parsedLimit),
        total_items: totalItems,
      },
    };

    logger.info(`✅ Fetched ${products.length} products (page ${parsedPage})`);
    return res.status(200).json(response);
  } catch (err) {
    logger.error(`❌ Failed to fetch products: ${err.message}`);
    return res.status(500).json({
      statusCode: 500,
      message: "Server error",
      data: err.message,
    });
  }
};

export const searchProduct = async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) {
      let set_res = {
        statusCode: 400,
        message: "Search key is required",
        data: null
      };
      logger.error("❌ Search key is required");
      return res.status(400).json(set_res);
    }
    const searchKey = `%${key.toLowerCase()}%`;
    const [products] = await db.query(constantBook.searchProduct, [searchKey, searchKey]);
    if (products.length === 0) {
      let set_res = {
        statusCode: 404,
        message: `No products found for search key "${key}"`,
        data: null
      };
      logger.info(`✅ No products found for search key "${key}"`);
      return res.status(404).json(set_res);
    }

    let set_res = {
      statusCode: 200,
      message: "Products fetched successfully",
      data: products
    };
    return res.status(200).json(set_res);
  } catch (err) {
    let set_res = {
      statusCode: 500,
      message: "Server error",
      data: err.message
    };
    logger.error(`❌ Failed to search products: ${err.message}`);
    return res.status(500).json(set_res);
  }
};

export const UpdateIsComplete = async (req, res) => {
  try {
    const productId = req.params.id;
    const { is_complete } = req.body;

    if (is_complete === undefined) {
      let set_res = {
        statusCode: 400,
        message: "is_complete field is required",
        data: null
      };
      return res.status(400).json(set_res);
    }
    
    const [result] = await db.query(constantBook.UpdateIsComplete, [Boolean(is_complete), productId]);

    if (result.affectedRows === 0) {
      let set_res = {
        statusCode: 404,
        message: "Product not found or no changes made",
        data: null
      };
      return res.status(404).json(set_res);
    }

    let set_res = {
      statusCode: 200,
      message: "Product completion status updated successfully",
      data: {
        id: productId,
        is_complete: Boolean(is_complete)
      }
    };
    return res.status(200).json(set_res);

  } catch (error) {
    let set_res = {
      statusCode: 500,
      message: "Server error",
      data: error.message
    };
    logger.error(`❌ Failed to update completion status for product ID ${req.params.id}: ${error.message}`);
    return res.status(500).json(set_res);
  }
};

export const UpdateFollowers = async (req, res) => {
  try {
    const bookId = req.body.book_id;
    const userId = req.body.user_id;
    // Check if the book exists
    const [book] = await db.query(constantBook.getProductID, [bookId]);
    if (book.length === 0) {
      let set_res = {
        statusCode: 404,
        message: "Book not found",
        data: null
      };
      return res.status(404).json(set_res);
    }

    // Check if the user is already following the book
    const [existingFollow] = await db.query("SELECT * FROM book_followers WHERE book_id = ? AND user_id = ?", [bookId, userId]);
    
    if (existingFollow.length > 0) {
      // User is already following, so we unfollow
      await db.query("DELETE FROM book_followers WHERE book_id = ? AND user_id = ?", [bookId, userId]);
      let set_res = {
        statusCode: 200,
        message: "Unfollowed the book successfully",
        data: null
      };
      return res.status(200).json(set_res);
    } else {
      // User is not following, so we follow
      await db.query("INSERT INTO book_followers (book_id, user_id) VALUES (?, ?)", [bookId, userId]);
      let set_res = {
        statusCode: 200,
        message: "Followed the book successfully",
        data: null
      };
      return res.status(200).json(set_res);
    }
  } catch (error) {
    let set_res = {
      statusCode: 500,
      message: "Server error",
      data: error.message
    };
    logger.error(`❌ Failed to update followers for book ID ${req.params.id}: ${error.message}`);
    return res.status(500).json(set_res);
  }
};