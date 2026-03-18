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
public_users.get('/',async function (req, res) {
  //Write your code here
    return res.send(JSON.stringify({books}, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  //Write your code here

   const isbn = req.params.isbn;

   const filteredBooks = Object.values(books).filter(
   book => book.isbn === isbn
   );

   return res.status(200).json(filteredBooks); 

 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  //Write your code here
    const author = req.params.author;

    const filteredBooks = Object.values(books).filter(
    book => book.author === author
    );

    return res.status(200).json(filteredBooks);
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  //Write your code here
    
    const title = req.params.title;

    const filteredBooks = Object.values(books).filter(
    book => book.title === title
    );

    return res.status(200).json(filteredBooks); 

});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here

    const isbn = req.params.isbn;

    const filteredBooks = Object.values(books).filter(
    book => book.isbn === isbn
    );

    return res.status(200).json(filteredBooks); 

});

module.exports.general = public_users;
