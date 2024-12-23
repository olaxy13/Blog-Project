const Blog = require("../models/Blog");
const calculateReadingTime = require("../utils/readingTime.js")


const getAllBlogs =async (req, res, next) => {
        try {
            // Get page and limit from query parameters, default to page 1 and limit 10
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 20) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search || ''; // Search term
        const sortBy = req.query.sortBy || 'timestamp'; // Field to sort by
        const order = req.query.order === 'asc' ? 1 : -1; // Sort order

        // Base query to fetch only published blogs
        const query = { state: 'published' };

        // Add search filters if a search term is provided
        if (search) {
          const regex = new RegExp(search, 'i'); // Case-insensitive regex for search
          const users = await User.find({ // Find authors matching the search term
            $or: [
              { first_name: regex },
              { last_name: regex }
            ]
          }).select('_id');
    
          query.$or = [
            { title: regex }, // Match title
            { tags: regex }, // Match tags
            { author: { $in: users.map(user => user._id) } } // Match author by ID
          ];
        }
         // Fetch blogs with filtering, pagination, and sorting
    const blogs = await Blog.find(query)
    .populate('author', 'first_name last_name email') // Include author details
    .sort({ [sortBy]: order }) // Apply sorting
    .skip(skip) // Apply pagination
    .limit(limit);

  // Respond with paginated and filtered blogs
  res.status(200).json({
    status: 'success',
    results: blogs.length,
    data: {
      blogs,
      totalPages: Math.ceil(numBlogs / limit),
      currentPage: page
    }
  });
} catch (error) {
    console.error("An Error Occurred:", error.message);
    res.status(500).json({ message: "An Internal Error Occurred" });
  }
};

const getBlog = async (req, res, next) => {
        const blog = await Blog.findById(req.params.id);
        if(!blog) {
            console.log("Blog", blog)
        return  next(new AppError("No blog found with that ID", 404))
        }
            res.status(200).json({
                status: "Success",
                data: {
                    blog
                }
            })
    }
const createBlog = async (req, res, next) => {
        try {
            const blog = new Blog(req.body);
          //const blog = new Blog({ ...req.body, author: req.user.id });
          blog.reading_time = calculateReadingTime(blog.body);
          await blog.save();
          res.status(201).json(blog);
        } catch (error) {
            console.log("An Error Occured", error.message)
          res.status(400).json({ message: "Internal error message" });
        }
      };
const updateBlogStatus = async (req, res, next) => {
        try {
            const blog = await Blog.findByIdAndUpdate(req.params.id, {status: "published"})
            
            if(!blog) {
                res.status(404).json({
                    message: 'Blog not found'
                });
            }
            res.status(200).json({
                status: "Success",
                message: "Blog updated",
                data: {
                    blog
                }
            })

            res.redirect('/blogs');
        } catch (error) {
            next(error)
        }
    }

const deleteBlog = async (req, res, next) => {
        try {
            const blog = await Blog.findByIdAndDelete(req.params.id)  
        if(!blog) {
            return  next(new AppError("No book found with that ID", 404))
            }
            res.status(204).json({
                status: "success",
                data: null
            })
        res.redirect('/tasks');
        } catch (error) {
            console.log("An error Occued", error.message)
            res.status(500).json({message: "An Internal Error Occured"})
        }
        

    }
    

    module.exports = {
        getAllBlogs,
        getBlog,
        createBlog,
        updateBlogStatus,
        deleteBlog
    }