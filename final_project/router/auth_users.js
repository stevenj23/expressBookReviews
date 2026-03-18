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
//   return res.status(300).json({message: "Yet to be implemented"});

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
    accessToken: token
    };

    return res.status(200).json({
    message: "User successfully logged in",
    token: token
    });


});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
//   return res.status(300).json({message: "Yet to be implemented"});

    const isbn = req.params.isbn;
    const review = req.query.review;

    // Get username from session
    const username = req.session.authorization.username;

    // Validate input
    if (!review) {
    return res.status(400).json({ message: "Review is required" });
    }

    // Check if book exists
    
    // Ensure book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    
    // Ensure reviews object exists
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }
    
    // Check if user already reviewed
    const isUpdate = books[isbn].reviews.hasOwnProperty(username);
    
    // Add or update review
    books[isbn].reviews[username] = {
        review: review,
        updatedAt: new Date().toISOString()
    };
    
    return res.status(200).json({
        message: isUpdate ? "Review updated successfully" : "Review added successfully",
        reviews: books[isbn].reviews
    });

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
