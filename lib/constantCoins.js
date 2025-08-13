
const constantCoins = {
    checkDataCheckins: `
        SELECT COUNT(*) as count FROM checkins WHERE user_id = ? AND checkin_date = CURDATE()
    `,
    addDataCheckins: `
        INSERT INTO checkins (user_id, checkin_date) VALUES (?, CURDATE())
    `,
    addCoins: `
        INSERT INTO coins (user_id, amount, type, created_at)
        VALUES (?, ?, ?, NOW())
    `,
    getTransactionHistory: `
        SELECT * FROM coins WHERE user_id = ? ORDER BY created_at DESC
    `,
    addCoinsEpisode: `
        INSERT INTO coins (user_id, amount, type, description, created_at)
        VALUES (?, ?, ?, ?, NOW())
    `
}
export default constantCoins;