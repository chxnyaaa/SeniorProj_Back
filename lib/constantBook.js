
const constantBook = {
    getRatingQuery: `
        SELECT COUNT(*) as count FROM ratings WHERE user_id = ? AND book_id = ?
    `,
    deleteRatingQuery: `
        DELETE FROM ratings WHERE user_id = ? AND book_id = ?
    `,
    addRatingQuery: `
        INSERT INTO ratings (user_id, book_id, rating, comment) VALUES (?, ?, ?, ?)
    `,
    searchBooksQuery: `
        SELECT * FROM books WHERE title LIKE ?
    `,
    updateBookQuery: `
        UPDATE books SET title = ?, user_id = ?, description = ?, cover_image = ?, release_date = ?, status = ? WHERE id = ?
    `,
    addBookQuery: `
        INSERT INTO books (title, user_id, description, cover_image, release_date, status) VALUES (?, ?, ?, ?, ?, ?)
    `,
    getBooksQuery: `
    SELECT 
                a.*,
                (SELECT COUNT(*) 
                FROM episodes r 
                WHERE r.book_id = a.id) AS episodes_count,
                (SELECT COUNT(*) 
                FROM favorites f 
                WHERE f.book_id = a.id) AS favorites_count,
                (SELECT COUNT(*) 
                FROM purchases c
                WHERE c.book_id = a.id) AS purchases_count
            FROM books a
            WHERE a.user_id = ?
    `,
    updateBookCompleteQuery: `
        UPDATE books SET is_complete = ? WHERE id = ?
    `,
    getBookByIdQuery: `
        SELECT a.*, b.pen_name,
        (SELECT COUNT(*) FROM ratings r WHERE r.book_id = a.id) AS rating_count,
        (SELECT AVG(rating) FROM ratings r WHERE r.book_id = a.id) AS avg_rating,
        (SELECT COUNT(*) FROM favorites f WHERE f.book_id = a.id) AS followers
        FROM books a
            LEFT JOIN users b on b.id = a.user_id
        WHERE a.id = ?
    `,
}
export default constantBook;