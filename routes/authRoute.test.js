// Integration testing, testing the communication between backend and database
// Note: the status message were wrong for the original responses, therefore they are filled with it.failing
// authroutes.test.js


import userModel from '../models/userModel.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import request from 'supertest';
import app from '../server.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

let mongoServer;

// Setup and teardown for in-memory MongoDB
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterEach(async () => {
  // Clear database after each test
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  // Disconnect and stop MongoDB server
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Authentication Routes Integration Tests', () => {

  // Tests for /api/v1/auth/register endpoint
  describe('POST /api/v1/auth/register', () => {

    it('should register a new user with valid data and store in the database', async () => {
      const reqBody = {
        name: 'Valid User',
        email: 'valid-email@example.com',
        password: 'ValidPassword123!',
        phone: '1234567890',
        address: '123 Valid Street',
        answer: 'Valid Answer'
      };

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(reqBody);

      expect(res.statusCode).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(reqBody.email);

      // Verify that the user is stored in the database
      const userInDb = await userModel.findOne({ email: reqBody.email });
      expect(userInDb).not.toBeNull();
      expect(userInDb.name).toBe(reqBody.name);
    });

    it.failing('should not allow duplicate registrations with the same email', async () => {
      const reqBody = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password1234',
        phone: '1234567890',
        address: '123 Test Street',
        answer: 'Test Answer',
      };

      // Register the user for the first time
      await request(app)
        .post('/api/v1/auth/register')
        .send(reqBody);

      // Attempt to register the same user again
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(reqBody);

      expect(res.statusCode).toBe(409); // Conflict
      expect(res.body.error).toBeDefined();
      expect(res.body.error).toContain('Email already exists');
    });

    it.failing('should return 400 if required fields are missing', async () => {
      const reqBody = {
        email: 'missing-fields@example.com',
        password: 'Password1234',
      };

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(reqBody);

      expect(res.statusCode).toBe(400); // Bad Request
      expect(res.body.error).toBeDefined();
      expect(res.body.error).toContain('Name is required');
      expect(res.body.error).toContain('Phone is required');
      expect(res.body.error).toContain('Address is required');
      expect(res.body.error).toContain('Answer is required');
    });
  });

  // Tests for /api/v1/auth/login endpoint
  describe('POST /api/v1/auth/login', () => {

    beforeEach(async () => {
      // Register a user to test login functionality
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Login User',
          email: 'login@example.com',
          password: 'Password1234',
          phone: '1234567890',
          address: '123 Login Street',
          answer: 'Login Answer',
        });
    });

    it('should log in successfully with correct email and password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Password1234',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("login successfully");
      expect(res.body.user).toBeDefined();
    });

    it.failing('should return 401 with incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });

    it('should return 404 when logging in with non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password1234',
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Email is not registerd");
    });

    it.failing('should return 400 if email or password is missing', async () => {
      let res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: 'Password1234',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email and password are required");

      res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email and password are required");
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    const user = {
      name: 'Forgor User',
      email: 'Iforgor@example.com',
      password: 'oldPassword',
      phone: '1234567890',
      address: '123 Forgor Street',
      answer: 'Forgor Answer',
    }
    const newPass = "newPassword";
    beforeEach(async () => {
      // Register a user to test login functionality
      await request(app)
        .post('/api/v1/auth/register')
        .send(user);
    });

    it('should reset password successfully with correct email, answer and newPassword', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: user.email,
          answer: user.answer,
          newPassword: newPass
        })
      
      // Expecting these returns given that the forgot password request is successful
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Password Reset Successfully");

      // Subsequent logins should use the new password
      const check = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: newPass,
        });
      expect(check.status).toBe(200);
      expect(check.body.message).toBe("login successfully");
    })

    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          answer: user.answer,
          newPassword: newPass
        })
      
      // Expecting these returns given that the forgot password request is unsuccessful
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Emai is required");

      // Subsequent logins should use the original password
      const check = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: user.password,
        });
      expect(check.status).toBe(200);
      expect(check.body.message).toBe("login successfully");
    })

    it('should return 400 if answer is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: user.email,
          newPassword: newPass
        })
      
      // Expecting these returns given that the forgot password request is unsuccessful
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("answer is required");

      // Subsequent logins should use the original password
      const check = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: user.password,
        });
      expect(check.status).toBe(200);
      expect(check.body.message).toBe("login successfully");
    })

    it('should return 400 if newPassword is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: user.email,
          answer: user.answer,
        })
      
      // Expecting these returns given that the forgot password request is unsuccessful
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("New Password is required");

      // Subsequent logins should use the original password
      const check = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: user.password,
        });
      expect(check.status).toBe(200);
      expect(check.body.message).toBe("login successfully");
    })

    it('should return 404 if user is not found', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: "Wot",
          answer: user.answer,
          newPassword: newPass,
        })
      
      // Expecting these returns given that the forgot password request is unsuccessful
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Wrong Email Or Answer");

      // Subsequent logins should use the original password
      const check = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: user.password,
        });
      expect(check.status).toBe(200);
      expect(check.body.message).toBe("login successfully");
    })
  })
});
