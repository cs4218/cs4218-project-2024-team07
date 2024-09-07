import { jest } from '@jest/globals';
import {
  registerController,
  loginController,
  testController,
  forgotPasswordController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
} from "./authController.js";
import userModel from '../models/userModel.js';

jest.mock('../helpers/authHelper');  
jest.mock('../models/userModel', () => ({
    findOne: jest.fn(),  
    prototype: { save: jest.fn() },  
  }));


describe('registerController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        phone: '1234567890',
        address: '123 Test Street',
        answer: 'Test Answer',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it('should return error if name is missing', async () => {
    req.body.name = '';  
    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({ error: 'Name is Required' });
  });

  it('should return error if email is missing', async () => {
    req.body.email = '';  
    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({ message: 'Email is Required' });
  });

  it('should return error if user already exists', async () => {
    
  });

  it('should register a new user successfully', async () => {

  });
  
  it('should return an error if something goes wrong', async () => {

  });
});
