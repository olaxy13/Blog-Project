const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true, 
  },
  tags: {
    type: [String], // Array of tags for categorization
    default: [],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links to the User 
     },
  state: {
    type: String,
    enum: ['drafted', 'published'], // allowed states
    default: 'drafted',
  },
  read_count: {
    type: Number,
    default: 0, // Tracks how many times the article has been read
  },
  reading_time: {
    type: String, // Estimated time to read the article
      },
 }, {
timestamps: true
});



const Blog  = mongoose.model('Blog', blogSchema);
module.exports = Blog