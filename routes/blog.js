const express = require('express');
const Blog = require('../models/Blog');
const router = express.Router();
const isAuthenticated = require('../middleware/auth'); // Custom middleware to check user session
const blogController = require("../controllers/blog") ;

// GET blogs
router.get('/', isAuthenticated, blogController.getAllBlogs);

// POST blog (add)
 router.post('/create', isAuthenticated, blogController.createBlog);

// PUT blog (mark as completed)
router.put('/:id/complete', isAuthenticated, blogController.updateBlogStatus);

// DELETE blog
router.delete('/:id/delete', isAuthenticated, blogController.deleteBlog);



module.exports = router;
