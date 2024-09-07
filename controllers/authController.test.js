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
import orderModel from '../models/orderModel.js';

jest.mock("../models/userModel");
jest.mock("../models/orderModel");

jest.unstable_mockModule('../helpers/authHelper.js', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

describe("Register Controller", () => {
  it("placeholder", () => expect(true).toBe(true));
});

describe("Login Controller", () => {});

describe("Test Controller", () => {});

describe("Forgot Password Controller", () => {});

describe("Update Profile Controller", () => {});

describe("Get Orders Controller", () => {});

describe("Get All Orders Controller", () => {});

describe("Order Status Controller", () => {});
