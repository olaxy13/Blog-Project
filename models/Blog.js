const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
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
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author', // Links to the User 
    required: true,
  },
  status: {
    type: String,
    enum: ['Drafted', 'Published'], // allowed states
    default: 'Drafted',
  },
  readCount: {
    type: Number,
    default: 0, // Tracks how many times the article has been read
  },
  readingTime: {
    type: String, // Estimated time to read the article
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Article', articleSchema);

const Task  = mongoose.model('Task', taskSchema);
module.exports = Task