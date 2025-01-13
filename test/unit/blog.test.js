const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../../server'); // Assuming app.js is your entry point
const User = require('../../models/User');
//const setupTestDB = require("../../utils/test_utils/setUpTestDb");
const Blog = require('../../models/Blog');
const mongoose = require('mongoose');
const database = require("../../utils/database")
const {incrementField} = require("../../utils/readCount")

//setupTestDB();


 //jest.mock('../../models/User');
 //.mock('../../models/Blog');


describe("/blogs", () => { 

  let databaseConnection;

  beforeAll(async ()=> {
   databaseConnection = await database.connect()
  })
  
  
  afterAll(async () => {
   await databaseConnection.disconnect()
  })
  
  afterEach(async ()=> {
   await databaseConnection.cleanup()
  })


  let mockUser;
  let mockToken;

  beforeEach(async () => {
    // Mock user authentication
    const userData = {
      _id: new mongoose.Types.ObjectId(),
      first_name: "John",
      last_name: "Doe",
      email: "johndoe@example.com",
      username: "tester",
      password: "testing123",
    }
    mockUser = await User.create(userData);

    console.log("MOCK USER", mockUser)
    mockToken = jwt.sign({ id: mockUser._id}, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log("MOCK _USER _ ID", mockUser)
  });


describe("POST/ api/blog/create", ()=> {
  test("should return 201 and create a blog when all fields are valid", async () => {
    const mockBlog = {
      title: "Test Blog",
      body: "This is a test blog.",
      tags: ["test", "blog"],
      author: mockUser._id,
      reading_time: "2 mins",
    };
    console.log("USer IDDD",mockBlog.author)
    // jest.mock('jsonwebtoken', () => ({
    //   verify: jest.fn().mockReturnValue({ id: mockBlog }),
    // }));

    Blog.prototype.save = jest.fn().mockResolvedValue(mockBlog); // Mock the save method to return the mock blog

    const res = await request(app)
      .post("/blogs/create")
      .set("Authorization", `Bearer ${mockToken}`) // Mock token
      .send(mockBlog);
    console.log("RESPONSE _ FIRST", res.body)
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.message).toBe("Blog created successfully");
    expect(res.body.data.title).toBe(mockBlog.title);
    expect(res.body.data.author).toBe(mockUser._id.toString());
  });

  test("should return 400 if title or body is missing", async () => {
    const emptyBlog = {
      title: "", // Missing title
      body: "", // Missing body
    }
    const res = await request(app)
      .post("/blogs/create")
      .set("Authorization", `Bearer ${mockToken}`)
      .send(emptyBlog);
      console.log("RESPONSE", res.body)
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Title and body are required.");
  });

  test("should return 500 if a server error occurs", async () => {
    Blog.prototype.save = jest.fn().mockRejectedValue(new Error("Database error"));

    const res = await request(app)
      .post("/blogs/create")
      .set("Authorization", `Bearer ${mockToken}`)
      .send({
        title: "Test Blog",
        body: "This is a test blog.",
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Internal error message here2");
  });

})


describe("GET /blogs/forall", () => {
  test("should return all blogs for a valid user", async () => {

    User.findById = jest.fn().mockResolvedValue({
      _id: mockUser._id,
      first_name: "John",
      last_name: "Doe",
    });

     // Mock Blog.find to return the mock blogs
     Blog.find = jest.fn().mockResolvedValue([
      {
        title: "Test Blog",
        body: "This is a test blog.",
        state: "published",
      },
      {
        title: "Test Blog",
        body: "This is a test blog.",
        state: "drafted",
      },
    ]);

  const res = await request(app)
      .get("/blogs/forall")
      .set("Authorization", `Bearer ${mockToken}`)
      .query({ state: "all" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
      });

});

describe("GET /blogs", () => {
  test("should return all published blogs", async () => {
    // // Create a user to associate with the blogs
    // const mockUser = await User.create({
    //   first_name: "John",
    //   username: "testuser",
    //   last_name: "Doe",
    //   email: "john.doe@example.com",
    //   password: "password123", // You may hash this if necessary in your test setup
    // });
  
    // Create some mock blogs associated with the user
    await Blog.create([
      {
        title: "Blog 1",
        body: "Content 1",
        state: "published",
        description: "Testing",
        tags: ["test"],
        author: mockUser._id,
        createdAt: new Date(),
      },
      {
        title: "Blog 2",
        body: "Content 2",
        state: "drafted",
        description: "Testing Draft",
        tags: ["draft"],
        author: mockUser._id,
        createdAt: new Date(),
      },
    ]);
  
    // Send the GET request to fetch only published blogs
    const res = await request(app).get("/blogs").query({ state: "published" });
  
    // Assertions
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.blogs).toHaveLength(1); // Only one blog is published
    expect(res.body.data.blogs[0].state).toBe("published");
    expect(res.body.data.blogs[0].author.first_name).toBe("John");
  });
});


describe("GET /blogs/:id", () => {
  test("should return a blog with valid ID", async () => {

    // Create a published blog
    const mockBlog = await Blog.create({
      title: "Test Blog",
      body: "This is a test blog.",
      state: "published",
      description: "A test Blog",
      read_count: 10,
      author: mockUser._id,
    });
  
    console.log("MOCK_BLOG", mockBlog)
  console.log("MOCK_BLOG 2", mockBlog)
    // Send a GET request for the blog by ID
    const res = await request(app).get(`/blogs/${mockBlog._id}`);
  console.log("MOCK_BLOG 3", mockBlog)
    // Assertions
    expect(res.status).toBe(200);
    expect(res.body.data.blog).toHaveProperty("title", "Test Blog");
    expect(res.body.data.blog.read_count).toBe(11); // Incremented count
  });
  


  test("should return 404 if blog is not found", async () => {
    Blog.findById(null);

    const res = await request(app).get(`/blogs/${new mongoose.Types.ObjectId()}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("No blog found with that ID");
  });

  test("should return 403 if blog is drafted", async () => {
    
    const draftBlog = {
      _id: new mongoose.Types.ObjectId(),
      title: "Test Blog",
      state: "drafted",
      read_count: 10,
      body: "This is a Test body",
      description:"This is a description body",
      author: mockUser._id
    };
    await Blog.create(draftBlog)


    const res = await request(app).get(`/blogs/${draftBlog._id}`);
console.log("BODY",res.body)
    expect(res.status).toBe(403);
    expect(res.body.message).toBe("This blog is still a draft");
  });
});


describe("PUT /api/blogs/:id", () => {

  test("should update the blog status to published", async () => {

   User.findById = jest.fn().mockResolvedValue({
    _id: mockUser._id,
  });

      // Create some mock blogs associated with the user
     const mockBlog = await Blog.create(
        {
          _id: new mongoose.Types.ObjectId(),
          title: "Blog 1",
          body: "Content 1",
          state: "drafted",
          description: "Testing",
          tags: ["test"],
          author: mockUser._id,
          createdAt: new Date(),
        },
        );

    Blog.prototype.save = jest.fn().mockResolvedValue({ ...mockBlog, state: "published" });

    const res = await request(app)
      .put(`/blogs/${mockBlog._id}`)
      .set("Authorization", `Bearer ${mockToken}`);
        console.log("UPDATE BODY", res.body)
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Blog updated");
    expect(res.body.data.blog.state).toBe("published");
  });
});

describe("DELETE /blogs/:id", () => {


  test.only("should delete a blog successfully", async () => {

    User.findById = jest.fn().mockResolvedValue({
     _id: mockUser._id,
   });
 
       // Create some mock blogs associated with the user
      const mockBlog = await Blog.create(
         {
           _id: new mongoose.Types.ObjectId(),
           title: "Blog 1",
           body: "Content 1",
           state: "drafted",
           description: "Testing",
           tags: ["test"],
           author: mockUser._id,
           createdAt: new Date(),
         },
         );
 
     Blog.prototype.save = jest.fn().mockResolvedValue(mockBlog);
 
     const res = await request(app)
       .delete(`/blogs/${mockBlog._id}`)
       .set("Authorization", `Bearer ${mockToken}`);
         console.log("UPDATE BODY", res.body)
     expect(res.status).toBe(200);
     expect(res.body.message).toBe("Blog Deleted");
    });

 
  });

})
















// describe("POST /api/blogs/create", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   test("should create a blog successfully", async () => {
//     const mockUser = { _id: new mongoose.Types.ObjectId() };
//     const mockBlog = { title: "Test Blog", body: "Content", author: mockUser._id };

//     Blog.prototype.save = jest.fn().mockResolvedValue(mockBlog);

//     const res = await request(app)
//       .post("/api/blogs/create")
//       .set("Authorization", "Bearer mock-token")
//       .send({ title: "Test Blog", body: "Content" });

//     expect(res.status).toBe(201);
//     expect(res.body.message).toBe("Blog created successfully");
//   });

//   test("should return 400 if title or body is missing", async () => {
//     const res = await request(app)
//       .post("/api/blogs/create")
//       .set("Authorization", "Bearer mock-token")
//       .send({ title: "" });

//     expect(res.status).toBe(400);
//     expect(res.body.message).toBe("Title and body are required.");
//   });
// });




// const request = require('supertest');
// const app = require("../../server"); // ImpModel");
// const Blog = require("../../models/Blog")

// describe('POST /books/creatte', () => {
//   it('should Create a blog', async () => {
//     const blog = await Blog.create({
//       title: 'Test Blog',
//       author: 'Test Author',
//       tags: "HAshtah",
//       body: '1234567890',
//       description: 'Fiction',
      
//     });

//     const res = await request(app)
//       .post('/blog/create')
//       .send(blog);

//     expect(res.status).toBe(201);
//     expect(res.body.status).toBe('success');
//     expect(res.body.data.book.title).toBe('Test Blog');
//     expect(res.body.data.book.author).toBe('Test Author');
//      });

// //   it('should return a 404 status if the book is not found', async () => {
// //     const res = await request(app)
// //       .get('/v1/books/invalid-id')
// //       .send();

// //     expect(res.status).toBe(404);
// //     expect(res.body.status).toBe('fail');
// //     expect(res.body.message).toBe('Book not found');
// //   });
// });


// describe('GET /user/blogs', () => {

//   let mockUser;

//   beforeEach(() => {
//     mockUser = {
//       _id: new mongoose.Types.ObjectId(),
//       first_name: 'Test',
//       last_name: 'User',
//       email: 'test@gmail.com',
//     };

//     User.findById.mockResolvedValue(mockUser); // Mock the User.findById method to return the mock user
//   });

//   test('should return 200 and blogs for a valid user with no state filter', async () => {
//     const mockBlogs = [
//       { title: 'Test Blog 1', author: mockUser._id, state: 'published' },
//       { title: 'Test Blog 2', author: mockUser._id, state: 'drafted' }
//     ];

//     Blog.find.mockResolvedValue(mockBlogs); // Mock the Blog.find method to return mock blogs
//     Blog.countDocuments.mockResolvedValue(mockBlogs.length); // Mock the countDocuments method to return the number of blogs

//     const res = await request(app)
//       .get('/blogs')
//       .set('Authorization', 'Bearer mock-token') // Mock an authorization header
//       .query({ page: 1, limit: 10 });

//     expect(res.status).toBe(200);
//     expect(res.body.status).toBe('success');
//     expect(res.body.results).toBe(mockBlogs.length);
//     expect(res.body.data.blogs).toEqual(mockBlogs);
//   });

//   test('should return 400 for invalid user ID', async () => {
//     User.findById.mockResolvedValue(null); // Simulate no user found

//     const res = await request(app)
//       .get('/blogs')
//       .set('Authorization', 'Bearer mock-token') // Mock an authorization header

//     expect(res.status).toBe(400);
//     expect(res.body.status).toBe('error');
//     expect(res.body.message).toBe('Invalid user ID');
//   });

//   test('should return 404 if no blogs found for the user', async () => {
//     Blog.find.mockResolvedValue([]); // No blogs found
//     Blog.countDocuments.mockResolvedValue(0); // No blogs in the count

//     const res = await request(app)
//       .get('/user/blogs')
//       .set('Authorization', 'Bearer mock-token')
//       .query({ page: 1, limit: 10 });

//     expect(res.status).toBe(200);
//     expect(res.body.status).toBe('success');
//     expect(res.body.results).toBe(0);
//     expect(res.body.message).toBe('No blogs found');
//     expect(res.body.data.blogs).toEqual([]);
//   });

//   test('should return 400 for invalid state filter', async () => {
//     const res = await request(app)
//       .get('/user/blogs')
//       .set('Authorization', 'Bearer mock-token')
//       .query({ state: 'invalidState' });

//     expect(res.status).toBe(400);
//     expect(res.body.status).toBe('error');
//     expect(res.body.message).toBe('Invalid state filter');
//   });

//   test('should return 500 for internal server error', async () => {
//     // Simulate an error in the controller
//     Blog.find.mockRejectedValue(new Error('Database Error'));

//     const res = await request(app)
//       .get('/user/blogs')
//       .set('Authorization', 'Bearer mock-token')
//       .query({ page: 1, limit: 10 });

//     expect(res.status).toBe(500);
//     expect(res.body.message).toBe('An Internal Error Occurred');
//   });

// });










// const jwt = require('jsonwebtoken');
// const request = require('supertest');
// const app = require('../../server'); // Assuming app.js is your entry point
// const User = require('../../models/User');
// const setupTestDB = require("../../utils/test_utils/setUpTestDb");
// const Blog = require('../../models/Blog');
// const mongoose = require('mongoose');

// setupTestDB();

// jest.mock('../../models/User', () => ({
//   findById: jest.fn(),
//   create: jest.fn()
// }));
// jest.mock('../../models/Blog');

// describe("POST /blogs",  () => {
//   let mockUser;
//   let mockToken;

//   beforeEach(async() => {
//     // Mock user authentication
//     mockUser =  {
//       _id: new mongoose.Types.ObjectId().toString(),
//       first_name: "John",
//       last_name: "Doe",
//       email: "johndoe@example.com",
//       username: "tester", // Fixed typo from 'usernmae' to 'username'
//       password: "testing123",
//     }

//     await User.findById.mockResolvedValue(mockUser);
//      await User.create(mockUser);
//      // Correct placement for logging
  
//     // Generate mock token after mockUser is initialized
//     mockToken = jwt.sign({ id: mockUser._id}, process.env.JWT_SECRET, { expiresIn: '2h' });
//     console.log("MOCK _USER _ ID", mockUser._id);

//  });

//   test("should return 201 and create a blog when all fields are valid", async () => {
//     const mockBlog = {
//       title: "Test Blog",
//       body: "This is a test blog.",
//       tags: ["test", "blog"],
//       author: mockUser._id, // Correct usage of mockUser._id
//         };

//     Blog.prototype.save = jest.fn().mockResolvedValue(mockBlog); // Mock the save method to return the mock blog

//     const res = await request(app)
//       .post("/blogs/create")
//       .set("Authorization", `Bearer ${mockToken}`) // Use the generated mock token
//       .send(mockBlog);

//     console.log("RESPONSE _ FIRST", res.error);
//     expect(res.status).toBe(201);
//     expect(res.body.status).toBe("success");
//     expect(res.body.message).toBe("Blog created successfully");
//     expect(res.body.data.title).toBe(mockBlog.title);
//     expect(res.body.data.author).toBe(mockUser._id.toString());
//   });

//   test("should return 400 if title or body is missing", async () => {
//     const emptyBlog = { title: "", body: "" }; // Missing title and body
//     const res = await request(app)
//       .post("/blogs")
//       .set("Authorization", `Bearer ${mockToken}`)
//       .send(emptyBlog);

//     expect(res.status).toBe(400);
//     expect(res.body.message).toBe("Title and body are required.");
//   });
// });
