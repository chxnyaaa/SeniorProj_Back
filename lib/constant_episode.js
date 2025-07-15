// lib/constant_episode.js

const constantEpisode = {
  GetEpisodesByBookId: `
    SELECT * FROM episode WHERE book_id = ? ORDER BY release_date ASC
  `,
  GetEpisodesByBookIdWithLimit: `
    SELECT * FROM episode WHERE book_id = ? and id = ? 
  `,
  CreateEpisode: `
    INSERT INTO episode (book_id, title, content_text, cover_url, audio_url, file_url, release_date, status, price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  UpdateEpisode: `
    UPDATE episode SET
      book_id = ?,
      title = ?,
      content_text = ?,
      cover_url = ?,
      audio_url = ?,
      file_url = ?,
      release_date = ?,
      status = ?,
      price = ?
    WHERE id = ?
  `,

}

export default constantEpisode
