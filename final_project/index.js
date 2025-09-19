const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Session setup for customer routes
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// Middleware to protect routes under /customer/auth/*
app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session.authorization) {
        const token = req.session.authorization.accessToken;

        // Verify JWT token
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next(); // Proceed
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

const PORT = 5000;

// Mount routers
app.use("/customer", customer_routes); // login, add/modify/delete review
app.use("/", genl_routes);             // public book routes

// REGISTER NEW USER (public)
const { users } = require('./router/auth_users.js');
app.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username and password required" });
    if (users.some(user => user.username === username)) return res.status(409).json({ message: "Username already exists" });

    users.push({ username, password });
    return res.status(201).json({ message: "User successfully registered" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
