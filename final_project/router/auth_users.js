const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    return users.some(user => user.username === username)
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    return users.some(user => 
        user.username === username && user.password === password
    );
}

//only registered users can login
regd_users.post("/login", (req, res) => {

    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    // Check if user exists
    if (!isValid(username)) {
        return res.status(404).json({ message: "User does not exist" });
    }

    // Authenticate user
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const accessToken = jwt.sign(
        { username: username },
        "access",
        { expiresIn: "1h" }
    );

    // Store in session
    req.session.authorization = {
        accessToken,
        username
    };

    // ✅ EXACT expected output
    return res.status(200).json({
        message: "Login successful!"
    });
});
// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    try {
        const isbn = req.params.isbn;
        const review = req.body.review;   // ✅ ONLY use body

        // Validate session
        const username = req.session?.authorization?.username;
        if (!username) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        // Validate review
        if (!review || review.trim() === "") {
            return res.status(400).json({
                message: "Review cannot be empty"
            });
        }

        // Check book
        const book = books[isbn];
        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        // Ensure reviews object exists
        if (!book.reviews) {
            book.reviews = {};
        }

        // Add / update review (simple format expected)
        book.reviews[username] = review.trim();

        // ✅ EXACT expected output
        return res.status(200).json({
            message: "Review added successfully",
            reviews: book.reviews
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error adding review"
        });
    }
});

// Delete a book review
// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    try {
        const isbn = req.params.isbn;

        // Validate session
        const username = req.session?.authorization?.username;
        if (!username) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        // Check book
        const book = books[isbn];
        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        // Check user review exists
        if (!book.reviews || !book.reviews[username]) {
            return res.status(404).json({
                message: "No review found"
            });
        }

        // Delete review
        delete book.reviews[username];

        // ✅ EXACT expected format
        return res.status(200).json({
            message: `Review for ISBN ${isbn} deleted`
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error deleting review"
        });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
