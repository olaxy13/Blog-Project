const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require("../models/User")
const { promisify } = require("util");
require('dotenv').config();
const SECRET_KEY = process.env.JWT_SECRET ;

const  isAuthenticated = async(req, res, next) => {
    // let token; 
    // if ( req.headers.authorization && 
    //     req.headers.authorization.startsWith("Bearer")) {
    //         console.log("TOKEN", token)
    //          token = req.headers.authorization.split(" ")[1];// we re-assing this value to the token
    //     }
        
    //     if(!token) {
    //         res.status(401).json({ message: "You are not logged in! Please log in to get Access.", })
    //     }
    //     console.log("TOKEN2", token)
    // 2) Verificaion token 
    try {
        const authHeader = req.header('Authorization');
        console.log("Authorization Header:", authHeader); // Log the Authorization header for debugging
    
        if (!authHeader || !authHeader.startsWith('Bearer')) {
          console.log('Authorization header is missing.');
          return res.status(401).json({ message: 'Unauthorized access: No token provided' });
        }
  
        const token = authHeader.split(' ')[1]; // Extract token after "Bearer"
        console.log("Extracted Token:", token); // Log the extracted token

        if (!token) {
            console.log('Token is missing in the Authorization header.');
            return res.status(401).json({ message: 'Unauthorized access: Malformed token' });
          }
          const decoded = jwt.verify(token, SECRET_KEY);
          console.log("Decoded Token:", decoded);
          if (!decoded.id) {
            console.log('Token is missing user ID.');
            return res.status(401).json({ message: 'Invalid token: Missing user ID' });
          }
        //const decoded = await promisify(jwt.verify)(token, SECRET_KEY)
    console.log("DEcoded:", decoded.id)
    const userId = decoded.id
        //3) chech if user still exists using the ID in the payload
        const currentUser = await User.findById(userId);
        console.log("Current userID:", currentUser)
        if(!currentUser) { 
          return  res.status(401).json({ message: "The User belonging to this token no longer exist", })
        }
    //console.log("Current User", currentUser._id)
       req.user = currentUser
       next()
    }
       
     catch (error) {
      console.log('Token Error.', error);
     return res.status(500).json({ message: 'Internal Error here' });
   // return res.redirect('/login'); // Redirect if token is invalid
       
    }
}
    
module.exports = isAuthenticated;
