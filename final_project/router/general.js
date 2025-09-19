const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// -------------------------
// Task: Register new user
// -------------------------
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// -------------------------
// Task 10: Get all books (async/await)
// -------------------------
public_users.get('/books', async (req, res) => {
    try {
        const allBooks = await new Promise((resolve, reject) => resolve(books));
        res.status(200).send(JSON.stringify(allBooks, null, 4));
    } catch (err) {
        res.status(500).json({ message: "Error fetching books", error: err.message });
    }
});

// -------------------------
// Task 11: Get book details by ISBN (async/await)
// -------------------------
public_users.get('/books/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const bookDetails = await new Promise((resolve, reject) => {
            if (books[isbn]) resolve(books[isbn]);
            else reject(new Error("Book not found"));
        });
        res.status(200).send(JSON.stringify(bookDetails, null, 4));
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
});

// -------------------------
// Task 12: Get books by author (async/await)
// -------------------------
public_users.get('/books/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        const matchingBooks = await new Promise((resolve, reject) => {
            const result = [];
            Object.keys(books).forEach(key => {
                if (books[key].author.toLowerCase() === author.toLowerCase()) {
                    result.push(books[key]);
                }
            });
            if (result.length > 0) resolve(result);
            else reject(new Error("No books found for this author"));
        });
        res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
});

// -------------------------
// Task 13: Get books by title (async/await)
// -------------------------
public_users.get('/books/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const matchingBooks = await new Promise((resolve, reject) => {
            const result = [];
            Object.keys(books).forEach(key => {
                if (books[key].title.toLowerCase() === title.toLowerCase()) {
                    result.push(books[key]);
                }
            });
            if (result.length > 0) resolve(result);
            else reject(new Error("No books found for this title"));
        });
        res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
});

// -------------------------
// Get book reviews
// -------------------------
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        return res.status(404).json({ message: "Review not found" });
    }
});

module.exports.general = public_users;
