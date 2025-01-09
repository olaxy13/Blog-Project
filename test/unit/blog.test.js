const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../../server'); // Assuming app.js is your entry point
const User = require('../../models/User');
const setupTestDB = require("../../utils/test_utils/setUpTestDb");
const Blog = require('../../models/Blog');
const mongoose = require('mongoose');

setupTestDB();


jest.mock('../../models/User');
jest.mock('../../models/Blog');


// describe("POST /blogs", () => {
//   let mockUser;
//   let mockToken;

//   beforeEach(() => {
//     // Mock user authentication
//     mockUser = new User ({
//       _id: new mongoose.Types.ObjectId(),
//       first_name: "John",
//       last_name: "Doe",
//       email: "johndoe@example.com",
//       usernmae: "tester",
//       password: "testing123",
//     });
//     mockToken = jwt.sign({ id: mockUser._id}, process.env.JWT_SECRET, { expiresIn: '1h' });
//     console.log("MOCK _USER _ ID", mockUser)
//   });
   
//   });
  

//   test("should return 201 and create a blog when all fields are valid", async () => {
//     const mockBlog = {
//       title: "Test Blog",
//       body: "This is a test blog.",
//       tags: ["test", "blog"],
//       author: mockUser._id,
//       reading_time: "2 mins",
//     };
//     console.log("USer IDDD",mockBlog.author)
//     // jest.mock('jsonwebtoken', () => ({
//     //   verify: jest.fn().mockReturnValue({ id: mockBlog }),
//     // }));

//     Blog.prototype.save = jest.fn().mockResolvedValue(mockBlog); // Mock the save method to return the mock blog

//     const res = await request(app)
//       .post("/blogs/create")
//       .set("Authorization", "Bearer mock-token") // Mock token
//       .send(mockBlog);
//     console.log("RESPONSE _ FIRST", res.body)
//     expect(res.status).toBe(201);
//     expect(res.body.status).toBe("success");
//     expect(res.body.message).toBe("Blog created successfully");
//     expect(res.body.data.title).toBe(mockBlog.title);
//     expect(res.body.data.author).toBe(mockUser._id.toString());
//   });

//   test("should return 400 if title or body is missing", async () => {
//     const emptyBlog = {
//       title: "", // Missing title
//       body: "", // Missing body
//     }
//     const res = await request(app)
//       .post("/blogs")
//       .set("Authorization", "Bearer mock-token")
//       .send(emptyBlog);

//     expect(res.status).toBe(400);
//     expect(res.body.message).toBe("Title and body are required.");
//   });

  // test("should return 500 if a server error occurs", async () => {
  //   Blog.prototype.save = jest.fn().mockRejectedValue(new Error("Database error"));

  //   const res = await request(app)
  //     .post("/blogs")
  //     .set("Authorization", "Bearer mock-token")
  //     .send({
  //       title: "Test Blog",
  //       body: "This is a test blog.",
  //     });

  //   expect(res.status).toBe(500);
  //   expect(res.body.message).toBe("Internal error message here2");
  // });
//});

// describe("GET /blogs/forall", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   test("should return all blogs for a valid user", async () => {
//     const mockUser = {
//       _id: new mongoose.Types.ObjectId(),
//       first_name: "John",
//       last_name: "Doe",
//     };

//     User.findById.mockResolvedValue(mockUser);

//     Blog.find.mockResolvedValue([
//       { title: "Blog 1", body: "Content 1", state: "published" },
//       { title: "Blog 2", body: "Content 2", state: "drafted" },
//     ]);

//     const res = await request(app)
//       .get("/blogs/forall")
//       .set("Authorization", "Bearer mock-token")
//       .query({ state: "all" });

//     expect(res.status).toBe(200);
//     expect(res.body.status).toBe("success");
//     expect(res.body.data.blogs).toHaveLength(2);
//   });

//   test("should return 404 if user is not found", async () => {
//     User.findById.mockResolvedValue(null);

//     const res = await request(app)
//       .get("/blogs/forall")
//       .set("Authorization", "Bearer mock-token");

//     expect(res.status).toBe(404);
//     expect(res.body.message).toBe("User not found");
//   });
// });

describe("GET /blogs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return all published blogs", async () => {
    Blog.find.mockResolvedValue([
      { title: "Blog 1", body: "Content 1", state: "published" , description: "Testing"},
    ]);

    Blog.countDocuments.mockResolvedValue(1);

    const res = await request(app).get("/blogs");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.blogs).toHaveLength(1);
  });

  test("should return 500 if there is a server error", async () => {
    Blog.find.mockRejectedValue(new Error("Database error"));

    const res = await request(app).get("/blogs");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("An Internal Error Occurred");
  });
});


// describe("GET /blogs/:id", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   test("should return a blog by ID", async () => {
//     const mockBlog = {
//       _id: new mongoose.Types.ObjectId(),
//       title: "Test Blog",
//       state: "published",
//       read_count: 10,
//     };

//     Blog.findById.mockResolvedValue(mockBlog);

//     const res = await request(app).get(`/blogs/${mockBlog._id}`);

//     expect(res.status).toBe(200);
//     expect(res.body.data.blog).toHaveProperty("title", "Test Blog");
//   });

//   test("should return 404 if blog is not found", async () => {
//     Blog.findById.mockResolvedValue(null);

//     const res = await request(app).get(`/blogs/${new mongoose.Types.ObjectId()}`);

//     expect(res.status).toBe(404);
//     expect(res.body.message).toBe("No blog found with that ID");
//   });

//   test("should return 403 if blog is drafted", async () => {
    
//     const draftBlog = {
//       _id: new mongoose.Types.ObjectId(),
//       title: "Test Blog",
//       state: "drafted",
//       read_count: 10,
//     };
//     Blog.findById.mockResolvedValue(draftBlog);

//     const res = await request(app).get(`/blogs/${new mongoose.Types.ObjectId()}`);

//     expect(res.status).toBe(403);
//     expect(res.body.message).toBe("No blog found with that ID");
//   });
// });



// describe("PUT /api/blogs/:id", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   test("should update the blog status to published", async () => {
//     const mockUser = {
//       _id: new mongoose.Types.ObjectId(),
//       first_name: "John",
//       last_name: "Doe",
//     };

//     User.findById.mockResolvedValue(mockUser);

//     const mockBlog = { _id: new mongoose.Types.ObjectId(), state: "drafted" };

//     Blog.findById.mockResolvedValue(mockBlog);
//     Blog.prototype.save = jest.fn().mockResolvedValue({ ...mockBlog, state: "published" });

//     const res = await request(app)
//       .put(`/blogs/${mockBlog._id}`)
//       .set("Authorization", "Bearer mock-token");

//     expect(res.status).toBe(200);
//     expect(res.body.message).toBe("Blog updated");
//     expect(res.body.state).toBe("published");
//   });
// });

// describe("DELETE /blogs/:id", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   test("should delete a blog successfully", async () => {
//     Blog.findById.mockResolvedValue({ _id: new mongoose.Types.ObjectId() });
//     Blog.deleteOne.mockResolvedValue({});

//     const res = await request(app)
//       .delete(`/blogs/${new mongoose.Types.ObjectId()}`)
//       .set("Authorization", "Bearer mock-token");

//     expect(res.status).toBe(200);
//     expect(res.body.message).toBe("Blog Deleted");
//   });
// });

















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
