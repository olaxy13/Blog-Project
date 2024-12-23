const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
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
    required: true,
  },
  state: {
    type: String,
    enum: ['Drafted', 'Published'], // allowed states
    default: 'Drafted',
  },
  read_count: {
    type: Number,
    default: 0, // Tracks how many times the article has been read
  },
  reading_time: {
    type: String, // Estimated time to read the article
    required: true,
  },
 }, {
timestamps: true
});



const Blog  = mongoose.model('Blog', blogSchema);
module.exports = Blog