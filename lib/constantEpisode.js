
const constantEpisode = {
    getEpisodeByBookIdQuery: `SELECT * FROM episodes WHERE book_id = ?`,
    addEpisodeQuery: `INSERT INTO episodes (book_id, user_id, title, content, is_free, price, cover, release_date, status, priority, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    updateEpisodeQuery: `UPDATE episodes SET title = ?, content = ?, cover = ?, price = ?, release_date = ?, status = ?, priority = ? WHERE id = ?`,
    getEpisodeByIdQuery: `SELECT * FROM episodes WHERE book_id = ? AND id = ? order by priority DESC`,
}
export default constantEpisode;