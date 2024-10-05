import { jest } from '@jest/globals';
import { forgotPasswordController } from '../controllers/authController';
import userModel from '../models/userModel';
import { hashPassword, comparePassword } from '../helpers/authHelper';

describe('forgotPasswordController', () => {
  let req;
  let res;
  let next;

  userModel.findOne = jest.fn();
  userModel.findByIdAndUpdate = jest.fn();

  const testUser = {
    _id: 'user123',
    email: 'test@example.com',
    answer: 'test answer',
    password: 'oldhashedpassword',
  };

  beforeEach(() => {
    req = {
      body: {
      email: 'test@example.com',
      answer: 'test answer',
      newPassword: 'newpassword123',
    },
    };
    res = {
      status: jest.fn().mockReturnThis(), // Allows chaining, e.g., res.status(200).send()
      send: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should reset password successfully with correct email, answer, and newPassword', async () => {
    userModel.findOne.mockResolvedValue(testUser);
    userModel.findByIdAndUpdate.mockResolvedValue();

    await forgotPasswordController(req, res, next);

    // Verify the response
    expect(userModel.findOne).toHaveBeenCalledWith({
      email: 'test@example.com',
      answer: 'test answer',
    });

    // Verifying that the findByIdAndUpdate arguments are called with the correct arguments
    const mockCalls = userModel.findByIdAndUpdate.mock.calls;
    expect(mockCalls.length).toBe(1);
    expect(await comparePassword("newpassword123", mockCalls[0][1].password)).toBe(true);
    expect(mockCalls[0][0]).toBe('user123');

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: 'Password Reset Successfully',
    });
  });

  it.failing('should return 400 if email is missing', async () => {
    req.body = { answer: 'test answer', newPassword: 'newpassword123' };

    await forgotPasswordController(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: 'Email is required' });
    expect(userModel.findOne).not.toHaveBeenCalled();
    expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it.failing('should return 400 if answer is missing', async () => {
    req.body = { email: 'test@example.com', newPassword: 'newpassword123' };

    await forgotPasswordController(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: 'answer is required' });
    expect(userModel.findOne).not.toHaveBeenCalled();
    expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it.failing('should return 400 if newPassword is missing', async () => {
    req.body = { email: 'test@example.com', answer: 'test answer' };

    await forgotPasswordController(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: 'New Password is required' });
    expect(userModel.findOne).not.toHaveBeenCalled();
    expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  // Tests both scenarios where the email is wrong or the answer is wrong
  it('should return 404 if user is not found', async () => {
    userModel.findOne.mockResolvedValue(null);

    req.body = {
      email: 'test@example.com',
      answer: 'test answer',
      newPassword: 'newpassword123',
    };

    await forgotPasswordController(req, res, next);

    expect(userModel.findOne).toHaveBeenCalledWith({
      email: 'test@example.com',
      answer: 'test answer',
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: 'Wrong Email Or Answer',
    });
  });

  it('should handle server errors gracefully', async () => {
    const error = new Error('Database error');
    userModel.findOne.mockRejectedValue(error);

    req.body = {
      email: 'test@example.com',
      answer: 'test answer',
      newPassword: 'newpassword123',
    };

    console.log = jest.fn(); // Mock console.log to suppress error output in test

    await forgotPasswordController(req, res, next);

    expect(console.log).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: 'Something went wrong',
      error,
    });
  });
});
