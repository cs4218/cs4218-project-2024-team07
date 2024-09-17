import { jest } from "@jest/globals";
// import slugify from "slugify";
import {
  createProductController,
  getProductController,
  getSingleProductController,
  productPhotoController,
  deleteProductController,
  updateProductController,
  productFiltersController,
  productCountController,
  productListController,
  searchProductController,
  realtedProductController,
  productCategoryController,
  braintreeTokenController,
  brainTreePaymentController,
} from "../controllers/productController.js";

import productModel from "../models/productModel.js";
// Still don't know how to mock a local model
// TODO: Mock productModel.
jest.mock("../models/productModel");
// const mockedProductModel = jest.createMockFromModule('../models/productModel.js');

const slugify = jest.createMockFromModule('slugify');
const fs = jest.createMockFromModule('fs');

// console.log(jest.isMockFunction(mockedProductModel)) // false
console.log("productModel.save: ", jest.isMockFunction(productModel.save)); // false
console.log("slugify: ", jest.isMockFunction(slugify)); // true
console.log("fs.func: ", jest.isMockFunction(fs.readFileSync)); // true

// You also need to mock individual methods if you want specific behavior in your tests
productModel.save = jest.fn().mockResolvedValue({}); // Mock specific methods

// Base case for a product request
const baseReq = {
  fields: {
    name: "test product name",
    description: "test description",
    price: 10,
    category: "test category",
    quantity: 10,
    shipping: true,
  },
  files: { photo: { size: 100000, path: "client/public/images/a1.png" } },
};
// Resetting mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

test("Create Product - success", async () => {
  const mockSave = jest.fn().mockResolvedValue({ _id: 1 });
  productModel.prototype.save = mockSave;
  const req = baseReq;
  const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  await createProductController(req, res);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      success: true,
      message: "Product Created Successfully",
    })
  );
  expect(mockSave).toHaveBeenCalled();
});

// Base request object

// Base response object
const createMockResponse = () => ({
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
});

test("Create Product - missing name", async () => {
  const req = { ...baseReq, fields: { ...baseReq.fields, name: "" } }; // Name is missing
  const res = createMockResponse();

  await createProductController(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      error: "Name is Required",
    })
  );
});

test("Create Product - missing description", async () => {
  const req = { ...baseReq, fields: { ...baseReq.fields, description: "" } }; // Description is missing
  const res = createMockResponse();

  await createProductController(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      error: "Description is Required",
    })
  );
});

test("Create Product - missing price", async () => {
  const req = { ...baseReq, fields: { ...baseReq.fields, price: "" } }; // Price is missing
  const res = createMockResponse();

  await createProductController(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      error: "Price is Required",
    })
  );
});

test("Create Product - missing category", async () => {
  const req = { ...baseReq, fields: { ...baseReq.fields, category: "" } }; // Category is missing
  const res = createMockResponse();

  await createProductController(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      error: "Category is Required",
    })
  );
});

test("Create Product - missing quantity", async () => {
  const req = { ...baseReq, fields: { ...baseReq.fields, quantity: "" } }; // Quantity is missing
  const res = createMockResponse();

  await createProductController(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      error: "Quantity is Required",
    })
  );
});

test("Create Product - photo too large", async () => {
  const req = {
    ...baseReq,
    files: { photo: { size: 2000000, path: "client/public/images/a1.png" } },
  }; // Photo size exceeds 1MB
  const res = createMockResponse();

  await createProductController(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      error: "photo is Required and should be less then 1mb",
    })
  );
});

test("Create Product - successful without photo", async () => {
  const req = { ...baseReq, files: {} }; // No photo provided
  const res = createMockResponse();

  // productModel.prototype.save.mockResolvedValue({ _id: 1 });

  await createProductController(req, res);

  expect(productModel.prototype.save).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      success: true,
      message: "Product Created Successfully",
    })
  );
});

test("Create Product - successful with photo", async () => {
  const req = { ...baseReq };
  const res = createMockResponse();

  // Mock file reading
  fs.readFileSync.mockReturnValue(Buffer.from("image data"));

  productModel.prototype.save.mockResolvedValue({ _id: 1 });

  await createProductController(req, res);
//   expect(fs.readFileSync).toHaveBeenCalledWith("client/public/images/a1.png");
  expect(productModel.prototype.save).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      success: true,
      message: "Product Created Successfully",
    })
  );
});

// test("Create Product - slugify name", async () => {
//   const req = { ...baseReq };
//   const res = createMockResponse();
//   slugify.mockReturnValue('test product name');
//   productModel.prototype.save.mockResolvedValue({ _id: 1 });

//   await createProductController(req, res);
//   expect(slugify).toHaveBeenCalled(); 
//   expect(slugify).toHaveBeenCalledWith("test product name");
//   expect(productModel.prototype.save).toHaveBeenCalled();
// });

test("Create Product - save operation fails", async () => {
  const req = { ...baseReq };
  const res = createMockResponse();

  // Simulate save failure
  const saveError = new Error("Database error");
  productModel.prototype.save.mockRejectedValue(saveError);

  await createProductController(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      success: false,
      message: "Error in crearing product",
    })
  );
});


// TODO: Add test cases for the rest of the controller methods.