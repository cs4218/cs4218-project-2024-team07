import { jest } from '@jest/globals';
import userModel from '../models/userModel.js';
import app from '../server.js'
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import request from 'supertest';
import { requireSignIn } from './authMiddleware.js';


dotenv.config();


// Before all describe blocks, connect to mongodb
beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL, {
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

      // Clean up the database before each test
      await userModel.deleteOne({ email: 'test-authMiddleware-hs@example.com' });

      await request(app)
      .post('/api/v1/auth/register')
      .send(signup_req.body);
    });
  
    it('should successfully authenticate with the token acquired from login', async () => {

      // Simulate an empty request object for the middleware
      let middlewareReq = {
          headers: {}
      };


      const loginRes = await request(app)
          .post('/api/v1/auth/login')
          .send(req.body);  
  

      const token = loginRes.body.token;
  
      // To ensure we have a token from login
      expect(token).toBeDefined();
  

      middlewareReq.headers.authorization = token;
  
      // Mock the next function for middleware
      const next = jest.fn();  
  

      await requireSignIn(middlewareReq, {}, next);
  

      expect(next).toHaveBeenCalled();
      expect(middlewareReq.user).toBeDefined(); // Check if req.user has been set with decoded user info
      expect(middlewareReq.user).toHaveProperty('_id');  // Assuming your token includes 'id'
  });
  

});


afterAll(async () => {
    await mongoose.connection.close();
});