import { jest } from '@jest/globals';
import userModel from '../models/userModel.js';
import { hashPassword } from '../helpers/authHelper';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import request from 'supertest';
import app from '../server.js'


dotenv.config();


// Before all describe blocks, connect to mongodb
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});


// NOTE, Input type detection is done on Frontend
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

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(req.body);

    expect(res.statusCode).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(req.body.email);
  });

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




  //--------------------------------------------------------------------------
  // Missing fields branch test
  // BUG 2: All of the status codes are wrong (should be 400 series) and does not follow error object

  it('should return error if name is missing', async () => {
    req.body.name = ''; // Simulate missing name
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(req.body);

    expect(res.body.error).toBe('Name is Required');
    expect(res.statusCode).toBe(200);
  });

  it('should return error if email is missing', async () => { 
    req.body.email = ''; // Simulate missing email
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(req.body);

    expect(res.body.message).toBe('Email is Required');
    expect(res.statusCode).toBe(200);
  });

  it('should return error if password is missing', async () => { 
    req.body.password = ''; // Simulate missing password
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(req.body);

    expect(res.body.message).toBe('Password is Required');
    expect(res.statusCode).toBe(200);
  });

  it('should return error if phone number is missing', async () => { 
    req.body.phone = ''; // Simulate missing phone number
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(req.body);

    expect(res.body.message).toBe('Phone no is Required');
    expect(res.statusCode).toBe(200);
  });

  it('should return error if address is missing', async () => { 
    req.body.address = ''; // Simulate missing address
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(req.body);

    expect(res.body.message).toBe('Address is Required');
    expect(res.statusCode).toBe(200);
  });

  it('should return error if answer is missing', async () => { 
    req.body.answer = ''; // Simulate missing answer
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(req.body);

    expect(res.body.message).toBe('Answer is Required');
    expect(res.statusCode).toBe(200);
  });

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

  it('should return 404 if email or password is missing', async () => {
    req.body.password = ''; // Missing password
    res = await request(app)
      .post('/api/v1/auth/login')
      .send(req.body);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Invalid email or password");
  
  });

  it('should return 404 if email is not registered', async () => {
    res = await request(app)
      .post('/api/v1/auth/login')
      .send(req.body);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Email is not registerd");
  });

  it('should return 200 with invalid password', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
          name: 'Test User',
          email: 'test-authController-hs@example.com',
          password: 'Password123',
          phone: '1234567890',
          address: '123 Test Street',
          answer: 'Test Answer',
        });

    res = await request(app)
      .post('/api/v1/auth/login')
      .send(req.body);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Invalid Password");
  });

  // it('should return 200 with valid credentials and a token', async () => {
  //   userModel.findOne.mockResolvedValue({ 
  //     _id: '12345',
  //     name: 'Test User',
  //     email: 'test-hs@example.com',
  //     phone: '1234567890',
  //     address: '123 Test Street',
  //     role: 'user',
  //     password: 'hashedPassword'
  //   });
  //   comparePassword.mockResolvedValue(true); // Password matches
  //   JWT.sign.mockReturnValue('mockedToken'); // Mock JWT token

  //   const res = await request(app)
  //     .post('/api/v1/auth/login')
  //     .send(req.body);

  //   expect(res.statusCode).toBe(200);
  //   expect(res.body.success).toBe(true);
  //   expect(res.body.message).toBe('login successfully');
  //   expect(res.body.user).toBeDefined();
  //   expect(res.body.user.email).toBe(req.body.email);
  //   expect(res.body.token).toBe('mockedToken');
  // });

  // it('should return 500 if there is an error during login', async () => {
  //   // Mock an error in the try block
  //   userModel.findOne.mockRejectedValue(new Error('Database error'));

  //   await request(app)
  //     .post('/api/v1/auth/login')
  //     .send(req.body);

  //   expect(res.status).toHaveBeenCalledWith(500);
  //   expect(res.send).toHaveBeenCalledWith({
  //     success: false,
  //     message: 'Error in login',
  //     error: expect.any(Error),
  //   });
  // });
});



// Close the connection after tests
afterAll(async () => {
  await mongoose.connection.close();
});