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
regd_users.post("/login", (req,res) => {
  //Write your code here

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
    const token = jwt.sign(
    { username: username },   // payload
    "access",                 // secret key (can be any string)
    { expiresIn: "1h" }       // optional expiry
    );

    // Save token in session
    req.session.authorization = {
        username: username,
        accessToken: token
    };

    return res.status(200).json({
    message: "User successfully logged in",
    token: token
    });


});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    try {
        const isbn = req.params.isbn;

        // Prefer body over query (but support both for flexibility)
        const review = req.body.review || req.query.review;

        // ✅ Validate session/user
        const username = req.session?.authorization?.username;
        if (!username) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        // ✅ Validate review input
        if (!review || review.trim() === "") {
            return res.status(400).json({
                message: "Review cannot be empty"
            });
        }

        // ✅ Check if book exists
        const book = books[isbn];
        if (!book) {
            return res.status(404).json({
                message: `Book not found with ISBN: ${isbn}`
            });
        }

        // ✅ Ensure reviews object exists
        if (!book.reviews) {
            book.reviews = {};
        }

        // ✅ Check if user already reviewed
        const isUpdate = Object.prototype.hasOwnProperty.call(book.reviews, username);

        // ✅ Add or update review
        book.reviews[username] = {
            review: review.trim(),
            updatedAt: new Date().toISOString()
        };

        return res.status(200).json({
            message: isUpdate
                ? "Review updated successfully"
                : "Review added successfully",
            isbn,
            user: username,
            reviews: book.reviews
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error adding/updating review",
            error: error.message
        });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    try {
        const isbn = req.params.isbn;

        // ✅ Validate session/user
        const username = req.session?.authorization?.username;
        if (!username) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        // ✅ Check if book exists
        const book = books[isbn];
        if (!book) {
            return res.status(404).json({
                message: `Book not found with ISBN: ${isbn}`
            });
        }

        // ✅ Check if reviews exist
        if (!book.reviews || Object.keys(book.reviews).length === 0) {
            return res.status(404).json({
                message: "No reviews available for this book"
            });
        }

        // ✅ Check if user has a review
        if (!Object.prototype.hasOwnProperty.call(book.reviews, username)) {
            return res.status(404).json({
                message: "No review found for this user"
            });
        }

        // ✅ Delete review
        delete book.reviews[username];

        return res.status(200).json({
            message: "Review deleted successfully",
            isbn,
            user: username,
            reviews: book.reviews
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error deleting review",
            error: error.message
        });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
