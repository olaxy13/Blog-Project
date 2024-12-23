const mongoose = require('mongoose')
const bcrypt = require('bcryptjs') // For hashing passwords

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    trim: true,
  },
  last_name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 2,
    maxlength: 10,
  },
  password: {
    type: String,
    required: true,
    minlength: 4, 
  },
  bio: {
    type: String,
    trim: true,
    maxLength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

const User =  mongoose.model('User', userSchema);

module.exports = User