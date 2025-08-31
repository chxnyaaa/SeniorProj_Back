const constantAuth = {
    getUserByemail: "select * from users where email = ? limit 1",
    insertUsers: "insert into users (username, email, password, role) values (?, ?, ?, ?)",
}
export default constantAuth;