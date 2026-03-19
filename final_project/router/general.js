const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');

const public_users = express.Router();

// Simulate async API call using Promise
const getBooksAsync = () => {
    return new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject("Books not found");
        }
    });
};

const getBookByISBNAsync = (isbn) => {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve({ isbn, ...book });
        } else {
            reject(`No book found with ISBN ${isbn}`);
        }
    });
};

const getBooksByAuthorAsync = (author) => {
    return new Promise((resolve, reject) => {
        const filteredBooks = Object.entries(books)
            .filter(([isbn, book]) =>
                book.author.toLowerCase() === author.toLowerCase()
            )
            .map(([isbn, book]) => ({
                isbn,
                ...book
            }));

        if (filteredBooks.length > 0) {
            resolve(filteredBooks);
        } else {
            reject(`No books found for author: ${author}`);
        }
    });
};

const getBooksByTitleAsync = (title) => {
    return new Promise((resolve, reject) => {
        const filteredBooks = Object.entries(books)
            .filter(([isbn, book]) =>
                book.title.toLowerCase() === title.toLowerCase()
            )
            .map(([isbn, book]) => ({
                isbn,
                ...book
            }));

        if (filteredBooks.length > 0) {
            resolve(filteredBooks);
        } else {
            reject(`No books found with title: ${title}`);
        }
    });
};

public_users.post("/register", (req,res) => {
  //Write your code here

    const username = req.body.username;
    const password = req.body.password;

    // Validate input
    if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if username already exists
    const existingUser = users.find(user => user.username === username);

    if (existingUser) {
    return res.status(409).json({ message: "Username already exists" });
    }

    // Add new user
    users.push({ username, password });

    return res.status(200).json({ message: "User registered successfully" });

});

// Get the book list available in the shop
//Task 10:
public_users.get('/', async function (req, res) {
    try {
        const data = await getBooksAsync();   // async call

        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({
            message: "Error fetching books",
            error: error
        });
    }
});

// Get book details based on ISBN
//Task 11:
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;

        const data = await getBookByISBNAsync(isbn);  // async call

        return res.status(200).json(data);

    } catch (error) {
        return res.status(404).json({
            message: error
        });
    }
});
  
// Get book details based on author
// Task 12:
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;

        const data = await getBooksByAuthorAsync(author);

        return res.status(200).json(data);

    } catch (error) {
        return res.status(404).json({
            message: error
        });
    }
});

// Get all books based on title
// Task 13: 
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;

    getBooksByTitleAsync(title)
        .then(data => {
            res.status(200).json(data);
        })
        .catch(error => {
            res.status(404).json({
                message: error
            });
        });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    try {
        const isbn = req.params.isbn;

        // Direct lookup (ISBN is the key)
        const book = books[isbn];

        // ✅ Handle "book not found"
        if (!book) {
            return res.status(404).json({
                message: `No book found with ISBN: ${isbn}`
            });
        }

        // ✅ Return only reviews (as intended)
        return res.status(200).json({
            isbn,
            reviews: book.reviews
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving book reviews",
            error: error.message
        });
    }
});

module.exports.general = public_users;
