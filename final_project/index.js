const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function (req, res, next) {

    if (req.session && req.session.authorization) {
        return next();
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }

});


// app.use("/customer/auth/*", function auth(req,res,next){
// //Write the authenication mechanism here

//     // if (req.session.authorization) { // Get the authorization object stored in the session
//     //     token = req.session.authorization['accessToken']; // Retrieve the token from authorization object
//     //     jwt.verify(token, "access", (err, user) => { // Use JWT to verify token
//     //     if (!err) {
//     //         req.user = user;
//     //         next();
//     //     } else {
//     //         return res.status(403).json({ message: "User not authenticated" });
//     //     }
//     //     });
//     // } else {
//     //     return res.status(403).json({ message: "User not logged in" });
//     // }
//     const token =
//         req.headers["authorization"]?.split(" ")[1] || // Bearer token
//         req.body.token;

//     if (!token) {
//         return res.status(403).json({ message: "Token missing" });
//     }

//     jwt.verify(token, "access", (err, user) => {
//         if (err) {
//             console.log("JWT ERROR:", err.message); // 👈 add this
//             return res.status(403).json({ message: "User not authenticated" });
//         }
    
//         console.log("DECODED USER:", user); // 👈 confirm success
//         req.user = user;
//         next();
//     });   

// });
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
