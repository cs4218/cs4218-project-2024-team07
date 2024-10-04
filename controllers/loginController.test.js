import { jest } from '@jest/globals';
import userModel from '../models/userModel.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import request from 'supertest';
import app from '../server.js'
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();
let mongoServer;

// since unit test, we will mock the db
// Before all describe blocks, we will start our mock db
beforeAll(async () => {
  // this is our in memory database
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // connect to the in mem db as usual
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterEach(async () => {
  // Clear all collections after each test
  await userModel.deleteMany({});
});

afterAll(async () => {
  // Close the Mongoose connection and stop the MongoDB server
  await mongoose.disconnect();
  await mongoServer.stop();
});


describe('/login', () => {
  let req, res;

  // Before each test, clear the user database
  beforeEach(async () => {
    req = {
      body: {
        email: 'test-authController-hs@example.com',
        password: 'Password1234',
      }
    };


    // Clean up the database before each test
    await userModel.deleteOne({ email: 'test-authController-hs@example.com' });
  });

  /*
  Pairwise Testing Table for Login Unit Tests

  | Test Case | Email       | Password   | Expected Outcome                              |
  |-----------|-------------|------------|----------------------------------------------|
  | 1         | Present     | Present    | Success: "login successfully"                |
  | 2         | Absent      | Present    | Failure: "Invalid email or password"         |
  | 3         | Incorrect   | Absent     | Failure: "Invalid email or password"         |
  | 4         | Present     | Incorrect  | Failure: "Invalid Password"                  |
  */

  it('should log in successfully with correct email and password', async () => {
    // First, register the user
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User',
        email: 'test-authController-hs@example.com',
        password: 'Password1234',
        phone: '1234567890',
        address: '123 Test Street',
        answer: 'Test Answer',
      });
  
    // Attempt login
    res = await request(app)
      .post('/api/v1/auth/login')
      .send(req.body);
  
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("login successfully");
    expect(res.body.user).toBeDefined();
  });

  it('should return 404 if email is missing', async () => {
    req.body.email = ''; 
    res = await request(app)
      .post('/api/v1/auth/login')
      .send(req.body);
  
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Invalid email or password");
  });
  
  it('should return 404 if email is incorrect and password is missing', async () => {
    req.body.email = 'wrong-email@example.com'; 
    req.body.password = ''; 
    res = await request(app)
      .post('/api/v1/auth/login')
      .send(req.body);
  
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Invalid email or password");
  });
  
  it('should return 200 with invalid password', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User',
        email: 'test-authController-hs@example.com',
        password: 'Password1234',
        phone: '1234567890',
        address: '123 Test Street',
        answer: 'Test Answer',
      });
  
    req.body.password = 'WrongPassword'; // Simulate incorrect password
    res = await request(app)
      .post('/api/v1/auth/login')
      .send(req.body);
  
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Invalid Password");
  });
});
