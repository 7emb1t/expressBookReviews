const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Base URL used by the Axios calls in Tasks 10-13 (they consume the routes below)
const BASE_URL = "http://localhost:" + (process.env.PORT || 5000);

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Both fields are mandatory
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // isValid() returns true only when the username is not already taken
    if (!isValid(username)) {
        return res.status(409).json({ message: "User " + username + " already exists. Please choose another username." });
    }

    users.push({ "username": username, "password": password });
    return res.status(201).json({ message: "User " + username + " successfully registered. Now you can login." });
});

// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
    // JSON.stringify with an indent of 4 prints the book list neatly
    return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        return res.status(200).send(JSON.stringify(book, null, 4));
    }
    return res.status(404).json({ message: "Book with ISBN " + isbn + " not found." });
});

// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const matching = {};

    // Obtain all the keys of the 'books' object and check each author
    Object.keys(books).forEach((isbn) => {
        if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
            matching[isbn] = books[isbn];
        }
    });

    if (Object.keys(matching).length > 0) {
        return res.status(200).send(JSON.stringify({ booksbyauthor: matching }, null, 4));
    }
    return res.status(404).json({ message: "No books found by author " + author });
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const matching = {};

    Object.keys(books).forEach((isbn) => {
        if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
            matching[isbn] = books[isbn];
        }
    });

    if (Object.keys(matching).length > 0) {
        return res.status(200).send(JSON.stringify({ booksbytitle: matching }, null, 4));
    }
    return res.status(404).json({ message: "No books found with title " + title });
});

// Task 5: Get a book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book with ISBN " + isbn + " not found." });
    }
    if (Object.keys(book.reviews).length === 0) {
        return res.status(200).json({ message: "No reviews found for this book." });
    }
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
});

/* ------------------------------------------------------------------
   Tasks 10-13: the same functionality as Tasks 1-4, this time written
   with Axios and async/await (Promise based, non blocking).
   ------------------------------------------------------------------ */

// Task 10: Get the list of books available in the shop using async/await with Axios
public_users.get('/async/books', async function (req, res) {
    try {
        const response = await axios.get(BASE_URL + "/");
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Error fetching the book list", error: error.message });
    }
});

// Task 11: Get book details based on ISBN using Promise callbacks with Axios
public_users.get('/async/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    axios.get(BASE_URL + "/isbn/" + isbn)
        .then((response) => {
            return res.status(200).send(JSON.stringify(response.data, null, 4));
        })
        .catch((error) => {
            return res.status(404).json({ message: "Book with ISBN " + isbn + " not found." });
        });
});

// Task 12: Get book details based on author using async/await with Axios
public_users.get('/async/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const response = await axios.get(BASE_URL + "/author/" + encodeURIComponent(author));
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        return res.status(404).json({ message: "No books found by author " + author });
    }
});

// Task 13: Get book details based on title using async/await with Axios
public_users.get('/async/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const response = await axios.get(BASE_URL + "/title/" + encodeURIComponent(title));
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        return res.status(404).json({ message: "No books found with title " + title });
    }
});

module.exports.general = public_users;
