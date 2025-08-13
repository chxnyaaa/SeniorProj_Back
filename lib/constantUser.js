
const constantUser = {
    getTransactionBookHistory: `
        SELECT * FROM books WHERE id in (
            SELECT book_id FROM purchases WHERE user_id = ? group by book_id
        )`,
    getTransactionEpisodeHistory: `
        SELECT * FROM purchases WHERE user_id = ? AND book_id = ?
    `,
    getFavoritesQuery: `
        SELECT * FROM favorites WHERE user_id = ? AND book_id = ?
    `,
    getUserFavorites: `
        SELECT * FROM favorites WHERE user_id = ?
    `,
    deleteFavoriteQuery: `
        DELETE FROM favorites WHERE user_id = ? AND book_id = ?
    `,
    addFavoriteQuery: `
        INSERT INTO favorites (user_id, book_id) VALUES (?, ?)
    `
}
export default constantUser;