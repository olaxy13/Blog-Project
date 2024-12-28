console.log("Got here 4")
const express = require('express');
const blogController = require("../controllers/blog") ;

const router = express.Router();
console.log("Got here 5")
const isAuthenticated = require('../middleware/auth'); // Custom middleware to check user session

// GET blogs
router.get('/',  blogController.getAllBlogs);
router.get('/:id',  blogController.getBlog);

// 
router.get('/forall', isAuthenticated, blogController.getAllBlogUser);

// POST blog (add)
 router.post('/create', isAuthenticated, blogController.createBlog);

// PUT blog (mark as completed)
router.put('/:id', isAuthenticated, blogController.updateBlogStatus);

// DELETE blog
router.delete('/:id', isAuthenticated, blogController.deleteBlog);



module.exports = router;
