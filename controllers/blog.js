const Blog = require("../models/Blog");
const User = require("../models/User");
const calculateReadingTime = require("../utils/readingTime.js")
const { incrementField } = require("../utils/readCount.js")
const mongoose = require("mongoose") 

const getAllBlogUser = async (req, res, next) => {

  try {
    const userID = req.user._id
    console.log("User ID:", userID)
 // Step 1: Validate `req.user`
  console.log("IT starts", req.user._id)
  if (!req.user || !req.user._id || !mongoose.Types.ObjectId.isValid(req.user._id)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid user ID',
    });
  }
 
    const findUser = await User.findById(userID)  
    console.log("I'm here", findUser._id)  
    if (!findUser) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    const state = req.query.state || ''; // Default to empty if not provided
    console.log("State:", state)
    let query = { author: findUser._id }; // Base query to find blogs by the user
console.log("Query:", query)
    //If the state query is provided, filter by the state
    if (state === "all") {
      // Fetch all states (published + drafted)
      query.state = { $in: ['published', 'drafted'] };
    } else if (state) {
      // Filter by the specific state provided
      if (!['published', 'drafted'].includes(state)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid state filter',
        });
      }
      query.state = state;
    } else {
      // Default to both published and drafted
      query.state = { $in: ['published', 'drafted'] };
    }
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 20) || 20;
  const skip = (page - 1) * limit;
  const sortBy = req.query.sortBy || 'timestamp'; // Field to sort by
  const order = req.query.order === 'asc' ? 1 : -1; // Sort order


  const numBlogs = await Blog.countDocuments(query);
  if (numBlogs === 0) {
    return res.status(200).json({
      status: 'success',
      results: 0,
      message: 'No blogs found',
      data: { blogs: [] }
    });
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
        const numBlogs = await Blog.countDocuments(query);
        if (numBlogs === 0) {
          return res.status(200).json({
            status: 'success',
            results: 0,
            message: 'No blogs found',
            data: { blogs: [] }
          });
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
    console.log("An Error Occurred:", error.message);
    res.status(500).json({ message: "An Internal Error Occurred" });
  }
};

const getBlog = async (req, res, next) => {
  const { id } = req.params; // Assuming you're passing `id` as a route parameter.

  if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
  }
  const blog = await Blog.findById(id);
        if(!blog) {
            console.log("Blog", blog)
            return  res.status(404).json({ message: "No blog found with that ID"})
        }
        console.log("BLOG STATE:", blog)
        if(blog.state === "drafted") {
          console.log("Blog", blog)
          return  res.status(403).json({ message: "This blog is still a draft"})
        }

        const blogCount = await incrementField(Blog, id, "read_count")
        blog.read_count = blogCount
        

            res.status(200).json({
                status: "Success",
                data: {
                    blog
                }
            })
    }
const createBlog = async (req, res, next) => {
        try {
          const { title, body, tags } = req.body;
          if (!title || !body) {
            return res.status(400).json({ message: "Title and body are required." });
          }

          const blog = new Blog({ ...req.body, author: req.user.id });
          blog.reading_time = calculateReadingTime(blog.body);
          await blog.save();
          res.status(201).json({status: "success",
            message: "Blog created successfully",
            data: blog,});
        } catch (error) {
            console.log("An Error Occured", error)
          res.status(500).json({ message: "Internal error message here2" });
        }
      };
const updateBlogStatus = async (req, res, next) => {
        try {
          
            const findUser = await User.findById(req.user)
            if (!findUser) {
              return res.status(404).json({ message: 'User not found' });
            }
            const userID = findUser._id
            console.log("UsER", userID)
           // const blog = await Blog.findByIdAndUpdate(req.params.id, {state: 'published'})
           const blog = await Blog.findById(req.params.id);
           if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
          }
           const blogID = blog.author
            console.log("BLOG", blogID)
            if(!blog) {
              return  res.status(404).json({
                    message: 'Blog not found'
                });
            }
          //   if(userID !== blogID) {
          //    return res.status(404).json({
          //         message: 'User has no authorization to update this blog'
          //     });
          // }

          if (!userID.equals(blogID)) {
            return res.status(403).json({
              message: 'User has no authorization to update this blog',
            });
          }
          blog.state = 'published';
          await blog.save();

            res.status(200).json({
                status: "Success",
                message: "Blog updated",
                data: {
                    blog
                }
            })

            //res.redirect('/blogs');
        } catch (error) {
          console.log("ERror here", error)

           res.status(500).json({ message: "Internal error message here 3"});

        }
    }

    const deleteBlog = async (req, res, next) => {
      try {
        const blogID = req.params.id
          const findUser = await User.findById(req.user)
          if (!findUser) {
            return res.status(404).json({ message: 'User not found' });
          }
          const userID = findUser._id
          console.log("UsER", userID)
         // const blog = await Blog.findByIdAndUpdate(req.params.id, {state: 'published'})
         const blog = await Blog.findById(blogID);
         if (!blog) {
          return res.status(404).json({ message: 'Blog not found' });
        }
         const blogAuthorID = blog.author
          console.log("BLOG", blogAuthorID)
          if(!blog) {
            return  res.status(404).json({
                  message: 'Blog not found'
              });
          }
        //   if(userID !== blogID) {
        //    return res.status(404).json({
        //         message: 'User has no authorization to update this blog'
        //     });
        // }

        if (!userID.equals(blogAuthorID)) {
          return res.status(403).json({
            message: 'User has no authorization to update this blog',
          });
        }
        
        await Blog.deleteOne({_id: blogID});

          res.status(200).json({
              status: "Success",
              message: "Blog Deleted",
              data: null          })

          //res.redirect('/blogs');
      } catch (error) {
        console.log("ERror here", error)

         res.status(500).json({ message: "Internal error message here 3"});

      }
  }
    

    module.exports = {
      getAllBlogUser, 
      getAllBlogs,
        getBlog,
        createBlog,
        updateBlogStatus,
        deleteBlog
    }