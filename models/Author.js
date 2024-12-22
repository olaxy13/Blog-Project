const mongoose = require('mongoose')
const bcrypt = require('bcryptjs') // For hashing passwords

const authorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
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
    minlength: 2
    maxlength: 10,
  },
  password: {
    type: String,
    required: true,
    minlength: 4, // Minimum length for password
  },
  bio: {
    type: String,
    trim: true,
    maxLength: 500,
  },
  profilePicture: {
    type: String, // URL to profile picture
    default: 'default-profile-picture-url', // Optional default value
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

const Author =  mongoose.model('Author', authorSchema);

module.exports = Author