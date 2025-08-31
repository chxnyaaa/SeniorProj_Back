
const constantPurchase = {
    addPurchase: `
        INSERT INTO purchases (user_id, book_id, episode_id, amount, purchased_at)
        VALUES (?, ?, ?, ?, NOW())
    `,
    getTransactionBookHistory: `
        SELECT * FROM books WHERE id in (
            SELECT book_id FROM purchases WHERE user_id = ? group by book_id
        )`,
    getTransactionEpisodeHistory: `
        SELECT * FROM purchases WHERE user_id = ? AND book_id = ?
    `,
    checkPurchase: `
        SELECT * FROM purchases WHERE user_id = ? AND book_id = ? AND episode_id = ?
    `,
}
export default constantPurchase;