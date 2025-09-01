
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
    `,
    getUserHistoryQuery: `
        SELECT 
        a.*,
        b.title AS book_title,
        c.title AS episode_title
        FROM user_history a
        LEFT JOIN books b ON a.book_id = b.id
        LEFT JOIN episodes c ON a.episode_id = c.id
        WHERE a.user_id = ? ORDER BY a.viewed_at DESC
    `,
    insertUserUpdateHistoryQuery: `
        INSERT INTO user_history (user_id, book_id, episode_id, device, ip_address, viewed_at)
        VALUES (?, ?, ?, ?, ?, NOW())
    `
}
export default constantUser;