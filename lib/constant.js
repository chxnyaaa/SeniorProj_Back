const constant = {
    // Sinup
    insertReader: "insert into users (username, email, password, role) values (?, ?, ?, ?)",
    insertWriter: "insert into users (username, email, password, pen_name, role) values (?, ?, ?, ?, ?)",
    
    getUserByProvider: `
    SELECT * FROM users 
    WHERE email = ? OR provider_id = ? 
    LIMIT 1
    `,

    insertReaderProvider: `
    INSERT INTO users (
        username, email, password, role, pen_name,
        provider, provider_id, avatar_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    getUserByEmailAndProvider: `
    SELECT * FROM users 
    WHERE email = ? AND provider_id = ? 
    LIMIT 1
    `,


    // Login
    // getUserByemail: "select * from users where email = ? or username = ? limit 1",
    getUserByemail: "select * from users where email = ? limit 1",
    // Product
    CreateProduct: "insert into books (title, description, cover_url, category, author_id, price_per_chapter, release_date, status) values (?, ?, ?, ?, ?, ?, ?, ?)",
    getProductID: "select * from books where id = ?",
    getProduct: "select * from books limit ?",
    searchProduct: ` SELECT * FROM books WHERE LOWER(title) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?) `,
    updatePenName: `update users set pen_name = ? ,role = ? where id = ?`,
    CheckPenName: `select * from users where pen_name = ? limit 1`,
}

export default constant;