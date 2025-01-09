const request = require("supertest");
const app = require("../../server");
const setupTestDB = require("../../utils/test_utils/setUpTestDb");
const User = require('../../models/User');
const bcrypt = require('bcryptjs')
setupTestDB();


describe("Auth routes", () => {
    let newUser;
    beforeEach(() => {
      newUser = {
        first_name: "Olamide",
        last_name: "Oke",
        username: "Olaxy",
        password: "Password.13",
        email: "test@gmail.com" ,
      };

    });

    describe("POST /api/user/signup", () => {
      test("should return 201 and successfully register user if request data is ok", async () => {
        const res = await request(app)
          .post("/user/signUp")
          .send(newUser)
         expect(res.status).toBe(201);
        expect(res.body.newUser.email).toBe("test@gmail.com");
      }, 10000);

      test("should return 400 all required fields are empty", async () => {
        const emptyUser = {
          username: "",
           password: "",
            email: "",
             first_name: "",
              last_name: "",
        }
        const res = await request(app)
          .post("/user/signUp")
          .send(emptyUser)
          //console.log("Email RES>>>",res.text)
         // console.log("Email RES>>>",res._data)
          expect(res.status).toBe(400);
        expect(res.body.message).toBe("All fields are required");
      });

      test("should return 400 error if email already exists", async () => {
        const userData = {
          email: 'duplicatetest@gmail.com',
          password: 'Password123',
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
        };
        // const res = await request(app)
        // .post("/user/signUp")
        // .send(userData)
        // console.log("STATUS>>>", res.status)
        // expect(res.status).toBe(201);
        // expect(res.body.newUser.email).toBe("duplicatetest@gmail.com");
      
        await User.create(userData)
       
       // Pre-create the user
  
        const duplicate = {
          email: 'duplicatetest@gmail.com',
          password: 'Password245',
          username: 'duplicateuser',
          first_name: 'Duplicate',
          last_name: 'Test',
        }

        // User.findOne({ email: userData.email});
        // newUser.email = "duplicatetest@gmail.com";
        // const res = await request(app)
        //   .post("/user/signUp")
        //   .send(newUser)
        //   expect(res.status).toBe(201);
        //   expect(res.body.newUser.email).toBe("duplicatetest@gmail.com");
        //   newUser.email = "duplicatetest@gmail.com";
      const duplicateRes = await request(app)
        .post("/user/signUp")
        .send(duplicate)
       // console.log("res TEXT>>>", duplicateRes.status)
     expect(duplicateRes.status).toBe(400);
      
      expect(duplicateRes.body.message).toBe("Email already exists");
      })

   });
    describe("POST /api/user/login", () => {
      test("should return 200 and login user if email and password match", async () => {
        const userData = {
          email: 'test@example.com',
          password: 'Password123',
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
        };
  
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await User.create({ ...userData, password: hashedPassword });
  
        const res = await request(app).post('/user/login').send({
          email: userData.email,
          password: 'Password123',
        });
  
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
      }, 20000); 

      test("should return 400 all required fields are empty", async () => {
        const emptyUser = {
           password: "",
            email: ""
        }
        const res = await request(app)
          .post("/user/login")
          .send(emptyUser)
          //console.log("Email RES>>>",res.text)
         // console.log("Email RES>>>",res._data)
          expect(res.status).toBe(400);
        expect(res.body.message).toBe("All fields are required");
      });


      test("should return 404 error if there are no users with that email", async () => {
        const nonExistingUser = {
          email: "nonexistent@example.com",
          password: "random",
        };
  
        const res = await request(app)
          .post("/user/login")
          .send(nonExistingUser)
          expect(res.status).toBe(404);
          expect(res.body).toHaveProperty("message", "User not found");
      });

      test("should return 400 and error message if password is invalid", async () => {
        const userData = {
          email: "test@example.com",
          password: "CorrectPassword",
          username: "testuser",
          first_name: "Test",
          last_name: "User",
        };
    
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await User.create({ ...userData, password: hashedPassword });
    
        const invalidPasswordAttempt = {
          email: userData.email,
          password: "WrongPassword",
        };
    
        const res = await request(app).post("/user/login").send(invalidPasswordAttempt);
    
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("message", "Invalid credentials");
      });
  
     });

 
  });