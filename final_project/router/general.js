const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');

const public_users = express.Router();


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
public_users.get('/',async function (req, res) {
  //Write your code here
    
    try {
        return res.send(JSON.stringify({books}, null, 4));
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching books",
            error: error.message
        });
    }
});

// Get book details based on ISBN
//Task 11:
public_users.get('/isbn/:isbn',async function (req, res) {
  //Write your code here
    try {
        const isbn = req.params.isbn;

        // Direct lookup using key
        const book = books[isbn];

        // ✅ Proper error handling
        if (!book) {
            return res.status(404).json({
                message: `No book found with ISBN: ${isbn}`
            });
        }

        // ✅ Return book with isbn included (optional but better API design)
        return res.status(200).json({
            isbn: isbn,
            ...book
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving book",
            error: error.message
        });
    }

 });
  
// Get book details based on author
// Task 12:
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;

        // Case-insensitive filtering
        const filteredBooks = Object.entries(books)
            .filter(([isbn, book]) =>
                book.author.toLowerCase() === author.toLowerCase()
            )
            .map(([isbn, book]) => ({
                isbn,
                ...book
            }));

        // ✅ Handle "not found"
        if (filteredBooks.length === 0) {
            return res.status(404).json({
                message: `No books found for author: ${author}`
            });
        }

        // ✅ Return structured response
        return res.status(200).json(filteredBooks);

    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving books by author",
            error: error.message
        });
    }
});

// Get all books based on title
// Task 13: 
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title;

        // Case-insensitive filtering + keep ISBN
        const filteredBooks = Object.entries(books)
            .filter(([isbn, book]) =>
                book.title.toLowerCase() === title.toLowerCase()
            )
            .map(([isbn, book]) => ({
                isbn,
                ...book
            }));

        // ✅ Handle "not found"
        if (filteredBooks.length === 0) {
            return res.status(404).json({
                message: `No books found with title: ${title}`
            });
        }

        // ✅ Return structured response
        return res.status(200).json(filteredBooks);

    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving books by title",
            error: error.message
        });
    }
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
