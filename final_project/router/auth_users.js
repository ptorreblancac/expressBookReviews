const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const books = require("./booksdb.js");

const regd_users = express.Router();
let users = [];

// Check if username is already registered
const isValid = (username) => users.some(user => user.username === username);

// Check if username/password match
const authenticatedUser = (username, password) => 
    users.some(user => user.username === username && user.password === password);

// LOGIN
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username and password required" });

    if (authenticatedUser(username, password)) {
        const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });
        req.session.authorization = { accessToken, username };
        return res.status(200).json({ message: "User successfully logged in", accessToken });
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
});

// ADD / MODIFY BOOK REVIEW
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session?.authorization?.username;

    if (!username) return res.status(403).json({ message: "User not logged in" });
    if (!books[isbn]) return res.status(404).json({ message: "Book not found" });

    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added/updated", reviews: books[isbn].reviews });
});

// DELETE BOOK REVIEW
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session?.authorization?.username;

    if (!username) return res.status(403).json({ message: "User not logged in" });
    if (!books[isbn] || !books[isbn].reviews[username]) return res.status(404).json({ message: "Review not found" });

    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
