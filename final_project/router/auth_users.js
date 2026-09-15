const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Returns true when the username is available (i.e. not already registered)
const isValid = (username) => {
    // Filter the registered users for a matching username
    const matching = users.filter((user) => user.username === username);
    return matching.length === 0;
}

// Returns true when the username/password pair matches a registered user
const authenticatedUser = (username, password) => {
    const matching = users.filter((user) => user.username === username && user.password === password);
    return matching.length > 0;
}

// Task 7: Only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (authenticatedUser(username, password)) {
        // Sign a JWT access token that stays valid for 1 hour
        const accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });

        // Save the token and the username in the session for later authorization
        req.session.authorization = { accessToken, username };

        return res.status(200).json({ message: "Customer successfully logged in", accessToken: accessToken });
    }
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;          // the review comes in as a request query
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book with ISBN " + isbn + " not found." });
    }
    if (!review) {
        return res.status(400).json({ message: "A review is required as a query parameter." });
    }

    // A review is stored under the username, so posting again replaces that
    // user's own review while reviews from other users stay untouched.
    const isModified = books[isbn].reviews.hasOwnProperty(username);
    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "The review for the book with ISBN " + isbn +
            (isModified ? " has been updated." : " has been added."),
        reviews: books[isbn].reviews
    });
});

// Task 9: Delete a book review posted by the logged in user
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book with ISBN " + isbn + " not found." });
    }

    // Only the review belonging to the session username is deleted
    if (!books[isbn].reviews.hasOwnProperty(username)) {
        return res.status(404).json({ message: "No review by user " + username + " found for the book with ISBN " + isbn });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: "Review for the ISBN " + isbn + " posted by the user " + username + " deleted.",
        reviews: books[isbn].reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
