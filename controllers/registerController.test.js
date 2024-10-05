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


describe('/register', () => {
  let req, res;

  // Before each test, clear the user database
  beforeEach(async () => {
    req = {
      body: {
        name: 'Test User',
        email: 'test-authController-hs@example.com',
        password: 'Password123',
        phone: '1234567890',
        address: '123 Test Street',
        answer: 'Test Answer',
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Clean up the database before each test
    // Will be using this email for tests
    await userModel.deleteOne({ email: 'test-authController-hs@example.com' });
  });


  // Test Case 1: Registration succeeds with all valid data
  it('should register a new user with valid data', async () => {
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
  });

  // additional test case where we test solely for duplicated account, without pairwise
  it('should return error if user already exists', async () => {
    await request(app)
    .post('/api/v1/auth/register')
    .send(req.body);

    const res2 = await request(app)
      .post('/api/v1/auth/register')
      .send(req.body);

    expect(res2.statusCode).toBe(200); 
    //BUG 1: Wrong status code, should be 409
    expect(res2.body.user).not.toBeDefined()
  });

  // NOTE:
  // Observation to be included in report: Due to the nature of pairwise testing, where (op1, op2) is tested concurrently
  // op1 and op2 share an AND relationship where as long as one of the op fails, the test itself fails. 
  // Also, for unit test, as per what we learnt, we treated the controller under test as a black box, therefore we are testing
  // for all tests related to authentication eg. extremely short password should give failure or phone number with letters
  // although the actual implementation of authController only takes into account the missing fields
  // Test Case 2: Registration fails (Name and Email absent)
  it.failing('should fail when name and email are absent', async () => {
    const reqBody = {
      // name is absent
      // email is absent
      password: 'ValidPassword123!',
      phone: '1234567890',
      address: '123 Valid Street',
      answer: 'Valid Answer'
    };

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);

    expect(res.statusCode).toBe(400); // Bad Request
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Name is required');
    expect(res.body.error).toContain('Email is required');
  });

  // Test Case 3: Invalid Name (contains numbers), Duplicate Email, Password absent
  it.failing('should fail with invalid name, duplicate email, and password absent', async () => {
    // First, register a user to create a duplicate email scenario
    const existingUser = {
      name: 'Existing User',
      email: 'duplicate@example.com',
      password: 'ValidPassword123!',
      phone: '1234567890',
      address: '123 Valid Street',
      answer: 'Valid Answer'
    };

    await userModel.create(existingUser);

    const reqBody = {
      name: 'Invalid123', // Invalid name with numbers
      email: 'duplicate@example.com', // Duplicate email
      // password is absent
      phone: '1234567890',
      address: '123 Valid Street',
      answer: 'Valid Answer'
    };

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Name cannot contain numbers');
    expect(res.body.error).toContain('Email already exists');
    expect(res.body.error).toContain('Password is required');
  });

  // Test Case 4: Invalid Name (special characters), Invalid Email (missing '@'), Weak Password (too short)
  it.failing('should fail with invalid name, invalid email, and weak password', async () => {
    const reqBody = {
      name: 'Invalid@Name', // Invalid name with special characters
      email: 'invalidemail.com', // Missing '@'
      password: '123', // Too short
      phone: '1234567890',
      address: '123 Valid Street',
      answer: 'Valid Answer'
    };

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Name cannot contain special characters');
    expect(res.body.error).toContain('Invalid email format');
    expect(res.body.error).toContain('Password is too short');
  });

  // Test Case 5: Invalid Email (invalid format), Weak Password (no special characters), Phone absent
  it.failing('should fail with invalid email, weak password, and phone absent', async () => {
    const reqBody = {
      name: 'Valid User',
      email: 'invalid-email-format', // Invalid format
      password: 'Password123', // No special characters
      // phone is absent
      address: '123 Valid Street',
      answer: 'Valid Answer'
    };

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Invalid email format');
    expect(res.body.error).toContain('Password must contain special characters');
    expect(res.body.error).toContain('Phone number is required');
  });

  // Test Case 6: Invalid Password (only digits), Invalid Phone (contains letters)
  it.failing('should fail with invalid password and invalid phone', async () => {
    const reqBody = {
      name: 'Valid User',
      email: 'valid@example.com',
      password: '1234567890', // Only digits
      phone: '12345abcde', // Contains letters
      address: '123 Valid Street',
      answer: 'Valid Answer'
    };

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Password cannot be only digits');
    expect(res.body.error).toContain('Phone number is invalid');
  });

  // Test Case 7: Invalid Phone (too short), Address absent
  it.failing('should fail with invalid phone and address absent', async () => {
    const reqBody = {
      name: 'Valid User',
      email: 'valid@example.com',
      password: 'ValidPassword123!',
      phone: '12345', // Too short
      // address is absent
      answer: 'Valid Answer'
    };

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Phone number is too short');
    expect(res.body.error).toContain('Address is required');
  });

  // Test Case 8: Invalid Address (no street number), Answer absent
  it.failing('should fail with invalid address and answer absent', async () => {
    const reqBody = {
      name: 'Valid User',
      email: 'valid@example.com',
      password: 'ValidPassword123!',
      phone: '1234567890',
      address: 'Valid Street', // No street number
      // answer is absent
    };

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Address must include street number');
    expect(res.body.error).toContain('Answer is required');
  });

  // Test Case 9: Invalid Address (too short), Invalid Answer (too short)
  it.failing('should fail with invalid address and invalid answer', async () => {
    const reqBody = {
      name: 'Valid User',
      email: 'valid@example.com',
      password: 'ValidPassword123!',
      phone: '1234567890',
      address: '12', // Too short
      answer: 'Hi' // Too short
    };

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Address is too short');
    expect(res.body.error).toContain('Answer is too short');
  });

  // Test Case 10: Address absent, Invalid Answer (too short)
  it.failing('should fail with address absent and invalid answer', async () => {
    const reqBody = {
      name: 'Valid User',
      email: 'valid@example.com',
      password: 'ValidPassword123!',
      phone: '1234567890',
      // address is absent
      answer: 'Hi' // Too short
    };

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Address is required');
    expect(res.body.error).toContain('Answer is too short');
  });

  // Test Case 11: Name absent
  it.failing('should fail when name is absent', async () => {
    const reqBody = {
      // name is absent
      email: 'valid@example.com',
      password: 'ValidPassword123!',
      phone: '1234567890',
      address: '123 Valid Street',
      answer: 'Valid Answer'
    };

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Name is required');
  });

  // Test Case 12: Invalid Name (contains numbers)
  it.failing('should fail with invalid name containing numbers', async () => {
    const reqBody = {
      name: 'User123', // Contains numbers
      email: 'valid@example.com',
      password: 'ValidPassword123!',
      phone: '1234567890',
      address: '123 Valid Street',
      answer: 'Valid Answer'
    };

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Name cannot contain numbers');
  });

  // Test Case 13: Invalid Name (special characters)
  it.failing('should fail with invalid name containing special characters', async () => {
    const reqBody = {
      name: 'User@Name', // Contains special characters
      email: 'valid@example.com',
      password: 'ValidPassword123!',
      phone: '1234567890',
      address: '123 Valid Street',
      answer: 'Valid Answer'
    };

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Name cannot contain special characters');
  });

  // Test Case 14: Email absent
  it.failing('should fail when email is absent', async () => {
    const reqBody = {
      name: 'Valid User',
      // email is absent
      password: 'ValidPassword123!',
      phone: '1234567890',
      address: '123 Valid Street',
      answer: 'Valid Answer'
    };

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Email is required');
  });

  // Test Case 15: Duplicate Email
  it.failing('should fail when email is duplicate', async () => {
    // First, register a user to create a duplicate email scenario
    const existingUser = {
      name: 'Existing User',
      email: 'duplicate@example.com',
      password: 'ValidPassword123!',
      phone: '1234567890',
      address: '123 Valid Street',
      answer: 'Valid Answer'
    };

    await userModel.create(existingUser);

    const reqBody = {
      name: 'New User',
      email: 'duplicate@example.com', // Duplicate email
      password: 'ValidPassword123!',
      phone: '0987654321',
      address: '456 New Street',
      answer: 'New Answer'
    };

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);

    expect(res.statusCode).toBe(409); // Conflict
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Email already exists');
  });

  // Test Case 16: Invalid Email (missing '@')
  it.failing('should fail with invalid email missing "@"', async () => {
    const reqBody = {
      name: 'Valid User',
      email: 'invalidemail.com', // Missing '@'
      password: 'ValidPassword123!',
      phone: '1234567890',
      address: '123 Valid Street',
      answer: 'Valid Answer'
    };

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Invalid email format');
  });

  // Test Case 17: Invalid Email (invalid format)
  it.failing('should fail with invalid email format', async () => {
    const reqBody = {
      name: 'Valid User',
      email: 'invalid-email@', // Invalid format
      password: 'ValidPassword123!',
      phone: '1234567890',
      address: '123 Valid Street',
      answer: 'Valid Answer'
    };

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Invalid email format');
  });

  // Test Case 18: Password absent
  it.failing('should fail when password is absent', async () => {
    const reqBody = {
      name: 'Valid User',
      email: 'valid@example.com',
      // password is absent
      phone: '1234567890',
      address: '123 Valid Street',
      answer: 'Valid Answer'
    };

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Password is required');
  });

  // Test Case 19: Weak Password (too short)
  it.failing('should fail with weak password that is too short', async () => {
    const reqBody = {
      name: 'Valid User',
      email: 'valid@example.com',
      password: 'Pass1', // Too short
      phone: '1234567890',
      address: '123 Valid Street',
      answer: 'Valid Answer'
    };
  
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);
  
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Password is too short');
  });

  // Test Case 20: Weak Password (no special characters)
  it.failing('should fail with weak password lacking special characters', async () => {
    const reqBody = {
      name: 'Valid User',
      email: 'valid@example.com',
      password: 'Password123', // No special characters
      phone: '1234567890',
      address: '123 Valid Street',
      answer: 'Valid Answer'
    };
  
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);
  
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Password must contain special characters');
  });

  // Test Case 21: Invalid Password (only digits)
  it.failing('should fail with invalid password containing only digits', async () => {
    const reqBody = {
      name: 'Valid User',
      email: 'valid@example.com',
      password: '12345678', // Only digits
      phone: '1234567890',
      address: '123 Valid Street',
      answer: 'Valid Answer'
    };
  
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);
  
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Password cannot be only digits');
  });

  // Test Case 22: Phone absent
  it.failing('should fail when phone is absent', async () => {
    const reqBody = {
      name: 'Valid User',
      email: 'valid@example.com',
      password: 'ValidPassword123!',
      // phone is absent
      address: '123 Valid Street',
      answer: 'Valid Answer'
    };
  
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);
  
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Phone number is required');
  });

  // Test Case 23: Invalid Phone (contains letters)
  it.failing('should fail with invalid phone containing letters', async () => {
    const reqBody = {
      name: 'Valid User',
      email: 'valid@example.com',
      password: 'ValidPassword123!',
      phone: '12345abcde', // Contains letters
      address: '123 Valid Street',
      answer: 'Valid Answer'
    };
  
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);
  
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Phone number is invalid');
  });

  // Test Case 24: Invalid Phone (too short or too long)
  it.failing('should fail with invalid phone length', async () => {
    const reqBody = {
      name: 'Valid User',
      email: 'valid@example.com',
      password: 'ValidPassword123!',
      phone: '1234', // Too short
      address: '123 Valid Street',
      answer: 'Valid Answer'
    };
  
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);
  
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Phone number is too short');
  });

  // Test Case 25: Invalid Address (no street number)
  it.failing('should fail with invalid address lacking street number', async () => {
    const reqBody = {
      name: 'Valid User',
      email: 'valid@example.com',
      password: 'ValidPassword123!',
      phone: '1234567890',
      address: 'Valid Street', // No street number
      answer: 'Valid Answer'
    };
  
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);
  
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Address must include street number');
  });

  // Test Case 26: Invalid Address (too short)
  it.failing('should fail with invalid address that is too short', async () => {
    const reqBody = {
      name: 'Valid User',
      email: 'valid@example.com',
      password: 'ValidPassword123!',
      phone: '1234567890',
      address: '12', // Too short
      answer: 'Valid Answer'
    };
  
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);
  
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Address is too short');
  });

  // Test Case 27: Answer absent
  it.failing('should fail when answer is absent', async () => {
    const reqBody = {
      name: 'Valid User',
      email: 'valid@example.com',
      password: 'ValidPassword123!',
      phone: '1234567890',
      address: '123 Valid Street',
      // answer is absent
    };
  
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);
  
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Answer is required');
  });

  // Test Case 28: Invalid Answer (too short)
  it.failing('should fail with invalid answer that is too short', async () => {
    const reqBody = {
      name: 'Valid User',
      email: 'valid@example.com',
      password: 'ValidPassword123!',
      phone: '1234567890',
      address: '123 Valid Street',
      answer: 'Hi' // Too short
    };
  
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(reqBody);
  
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toContain('Answer is too short');
  });
});