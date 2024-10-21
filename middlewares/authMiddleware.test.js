import { jest } from '@jest/globals';
import userModel from '../models/userModel.js';
import app from '../server.js'
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import request from 'supertest';
import { requireSignIn, isAdmin } from './authMiddleware.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

let mongoServer; 


beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

describe('Authentication middleware', () => {
    let req, res, signup_req;
  
    // Before each test, clear the user database
    beforeEach(async () => {
      req = {
        body: {
          email: 'test-authMiddleware-hs@example.com',
          password: 'Password1234',
        }
      };

      signup_req = {
        body: {
          name: 'Test User',
          email: 'test-authMiddleware-hs@example.com',
          password: 'Password1234',
          phone: '1234567890',
          address: '123 Test Street',
          answer: 'Test Answer',
        }
      };

      await userModel.deleteMany({}); 

      // Register the user before each test
      await request(app)
      .post('/api/v1/auth/register')
      .send(signup_req.body);
    });
  
    it('should successfully authenticate with the token acquired from login', async () => {
      let middlewareReq = {
          headers: {}
      };

      const loginRes = await request(app)
          .post('/api/v1/auth/login')
          .send(req.body);  

      const token = loginRes.body.token;
  
      // Ensure we have a token from login
      expect(token).toBeDefined();

      middlewareReq.headers.authorization = token;
  
      // Mock the next function for middleware
      const next = jest.fn();  

      await requireSignIn(middlewareReq, {}, next);
  
      expect(next).toHaveBeenCalled();
      expect(middlewareReq.user).toBeDefined(); 
      expect(middlewareReq.user).toHaveProperty('_id');  
  });
  
  it('should successfully verify whether a person is admin', async () => {
    let middlewareReq = {
        user: {}  
    };

    // Set the user to have admin rights
    await userModel.updateOne(
        { email: 'test-authMiddleware-hs@example.com' },  
        { $set: { role: 1 } }                             
    );

    const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send(req.body);  

    const test_id = loginRes.body.user._id;
    middlewareReq.user._id = test_id;
    
    const next = jest.fn();  

    await isAdmin(middlewareReq, {}, next);
    expect(next).toHaveBeenCalled();
    expect(middlewareReq.user).toBeDefined(); 
    expect(middlewareReq.user).toHaveProperty('_id'); 
  });
});


afterAll(async () => {
    await mongoose.disconnect();  
    await mongoServer.stop();     
});
