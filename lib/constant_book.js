// lib/constant_book.js

const constantBook = {
  CreateProduct: `
    INSERT INTO books 
      (title, description, cover_url, category, author_id, price_per_chapter, release_date, status, is_complete) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,

  UpdateProduct: `
    UPDATE books SET
      title = ?,
      description = ?,
      cover_url = COALESCE(?, cover_url),
      category = ?,
      author_id = ?,
      price_per_chapter = ?,
      release_date = ?,
      status = ?,
      is_complete = ?
    WHERE id = ?
  `,

  getProductID: `
    SELECT books.*,authors.pen_name ,authors.username ,authors.email,authors.avatar_url
    FROM books books 
    LEFT JOIN users authors ON books.author_id = authors.id
    WHERE books.id = ?
  `,

  getProduct: `
    SELECT * FROM books LIMIT ?
  `,

  searchProduct: `
    SELECT * FROM books 
    WHERE LOWER(title) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?)
  `,
  UpdateIsComplete: `
    UPDATE books SET is_complete = ? WHERE id = ?
  `,
};

export default constantBook;
