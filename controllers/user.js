const express = require('express')
const Blog = require('../models/Blog')
const User = require('../models/User')
// const adminLayout = '../views/layouts/admin'
// const loginRegisterLayout = '../views/layouts/login_register'
// const adminHomeLayout = '../views/layouts/admin-home'
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authenticate = require('../middleware/auth')


const register = async (req, res, next) => {
    try {
      //console.log("BODY:", req.body)
      const { username, password, email, first_name, last_name, } = req.body;

        if(!username || !password || !email || !first_name || !last_name) {
            return res.status(400).json({ message:"All fields are required"})   
          }
        
        const checkEmail = await User.exists({ email })
    
        //console.log("CHECK EMAIL>>", checkEmail)
     if (checkEmail) { 
       return res.status(400).json({ message:"Email already exists"})
     }
     //console.log("PASsowrd:", userInfo)
     const hashedPassword = await bcrypt.hash(password, 10)

     const userInfo = {first_name, last_name, email, username,  password: hashedPassword}    
     const newUser = await User.create(userInfo)
     await newUser.save()
     res.status(201).json({ message: "User created Successfully", newUser })
    }catch (error) {
        //console.log("Error Message>>", error)
        res.status(500).json({ message: "An Internal Error Occured", error: error.message });
      }
    }

const login = async (req, res, next) => {
    try {
        const { email, password, } = req.body;
        if (!email || !password) {
          return res.status(400).json({ message:"All fields are required"})   
            };
          //console.log(email, password)
      
          
          const user = await User.findOne({ email })
          //console.log('User Found:', user)
      
          if (!user) {
            return res.status(404).json({ message:"User not found"})   
        
          }
              // Compare the password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password)
    //console.log('Password Match:', isMatch)

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id }, process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      }
    ) 
    res.status(200).json({ token })

    // Store the token in a cookie
    // res.cookie('authToken', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production'|| false,
    //   sameSite: 'lax',
    //   maxAge: 1 * 60 * 60 * 1000,
    // })

    // Redirect to tasks
    // res.redirect('/admin/home')

  } catch (error) {
    console.log('Error during login:', error.message)
    res.status(500).json({ error: error.message });
  }
}
 




module.exports = {
  register,
  login
}

