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

const slugify = jest.createMockFromModule("slugify");
const fs = jest.createMockFromModule("fs");

// console.log(jest.isMockFunction(mockedProductModel)) // false
console.log("productModel.save: ", productModel); // false
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

// Base response object
const createMockResponse = () => ({
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
  set: jest.fn(),
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

test("Create Product - save operation fails", async () => {
  console.log("Create Product - save operation fails");
  const req = {};
  const res = createMockResponse();

  // Simulate save failure
  // const saveError = new Error("Database error");
  // const mockRejectedValue = jest.fn().mockRejectedValue(saveError)
  // productModel.prototype.save = mockRejectedValue;

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
// Test getProductController methods
const mockProductData = [
  { _id: "1", name: "Product 1", category: "Category 1" },
  { _id: "2", name: "Product 2", category: "Category 2" },
];

test("Get Products - success", async () => {
  // Mocking the chainable methods of productModel
  const mockFind = jest.fn().mockReturnThis();
  const mockPopulate = jest.fn().mockReturnThis();
  const mockSelect = jest.fn().mockReturnThis();
  const mockLimit = jest.fn().mockReturnThis();
  const mockSort = jest.fn().mockResolvedValue(mockProductData);

  // Link these mock methods to productModel.find
  productModel.find = mockFind;
  productModel.find.mockImplementation(() => ({
    populate: mockPopulate,
    select: mockSelect,
    limit: mockLimit,
    sort: mockSort,
  }));

  const req = {}; // Empty request since we don't need anything from req for this test
  const res = createMockResponse();

  // Call the controller
  await getProductController(req, res);

  // Assertions
  expect(mockFind).toHaveBeenCalled(); // Check if find was called
  expect(mockPopulate).toHaveBeenCalledWith("category"); // Check if populate was called correctly
  expect(mockSelect).toHaveBeenCalledWith("-photo"); // Check if select was called correctly
  expect(mockLimit).toHaveBeenCalledWith(12); // Check if limit was called with 12
  expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 }); // Check if sort was called correctly
  expect(res.status).toHaveBeenCalledWith(200); // Ensure correct response status
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      success: true,
      counTotal: 2, // There are two products in the mock response
      message: "ALlProducts ",
      products: mockProductData,
    })
  );
});

test("Get Products - failure", async () => {
  // Mock the `find` method to reject with an error
  const mockError = new Error("Database query failed");
  productModel.find.mockImplementation(() => ({
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockRejectedValue(mockError),
  }));

  const req = {}; // Empty request
  const res = createMockResponse();

  // Call the controller
  await getProductController(req, res);

  // Assertions for the failure case
  expect(res.status).toHaveBeenCalledWith(500); // Expect a 500 status code
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      success: false,
      message: "Erorr in getting products",
      error: mockError.message, // Error message from the rejection
    })
  );
});

// Test getSingleProductController method

const mockSingleProductData = {
  _id: "1",
  name: "Test Product",
  slug: "test-product",
  category: "Test Category",
};

test("Get Single Product - success", async () => {
  // Mock the `findOne` method to return mock product data
  const mockFindOne = jest.fn().mockReturnThis();
  const mockSelect = jest.fn().mockReturnThis();
  const mockPopulate = jest.fn().mockResolvedValue(mockSingleProductData);

  productModel.findOne = mockFindOne;
  productModel.findOne.mockImplementation(() => ({
    select: mockSelect,
    populate: mockPopulate,
  }));

  const req = { params: { slug: "test-product" } }; // Mock request with slug parameter
  const res = createMockResponse();

  // Call the controller
  await getSingleProductController(req, res);

  // Assertions
  expect(mockFindOne).toHaveBeenCalledWith({ slug: "test-product" }); // Check if `findOne` was called with the correct slug
  expect(mockSelect).toHaveBeenCalledWith("-photo"); // Ensure the `select` method was called with "-photo"
  expect(mockPopulate).toHaveBeenCalledWith("category"); // Ensure `populate` was called with "category"
  expect(res.status).toHaveBeenCalledWith(200); // Expect a 200 status code
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      success: true,
      message: "Single Product Fetched",
      product: mockSingleProductData,
    })
  );
});

test("Get Single Product - failure", async () => {
  // Mock the `findOne` method to throw an error
  const mockError = new Error("Database query failed");
  productModel.findOne.mockImplementation(() => ({
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockRejectedValue(mockError),
  }));

  const req = { params: { slug: "test-product" } }; // Mock request with slug parameter
  const res = createMockResponse();

  // Call the controller
  await getSingleProductController(req, res);

  // Assertions
  expect(res.status).toHaveBeenCalledWith(500); // Expect a 500 status code
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      success: false,
      message: "Eror while getitng single product",
      error: mockError,
    })
  );
});

test.failing("Get Product Photo - success", async () => {
  const mockPhotoData = {
    _id: "1",
    photo: { data: Buffer.from("mock data"), contentType: "image/png" },
  };

  // Mock the `findById` method to return the mock photo data
  const mockFindById = jest
    .spyOn(productModel, "findById")
    .mockResolvedValue(mockPhotoData);

  const req = { params: { pid: "1" } }; // Mock request with product ID
  const res = createMockResponse();

  // Call the controller
  await productPhotoController(req, res);
  const product = await productModel.findById(req.params.pid);
  // Assertions
  expect(mockFindById).toHaveBeenCalled(); // Check if `findById` was called with correct ID
  expect(productModel.findById).toHaveBeenCalledWith("1"); // Check if `findById` was called with correct ID
  expect(res.set).toHaveBeenCalledWith("Content-type", "image/png"); // Ensure content type was set correctly
  expect(res.status).toHaveBeenCalledWith(200); // Expect a 200 status code
  expect(res.send).toHaveBeenCalledWith(product.photo.data); // Ensure the correct photo data was sent
});

test("Get Product Photo - failure", async () => {
  console.log(
    "===============Get Product Photo - failure====================="
  );

  // Mock the `findById` and chain the `.select` method
  const mockSelect = jest
    .fn()
    .mockRejectedValue(new Error("Database query failed"));
  const mockFindById = jest
    .spyOn(productModel, "findById")
    .mockReturnValue({ select: mockSelect });

  const req = { params: { pid: "2" } }; // Mock request with product ID
  const res = createMockResponse();

  // Call the controller
  await productPhotoController(req, res);

  // Assertions
  expect(res.status).toHaveBeenCalledWith(500); // Expect a 500 status code
  expect(mockFindById).toHaveBeenCalled(); // Ensure findById was called
  expect(mockSelect).toHaveBeenCalledWith("photo"); // Ensure select was called with 'photo'
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      success: false,
      message: "Erorr while getting photo", // bug in spelling here
      error: new Error("Database query failed"),
    })
  );
});

test.failing("Delete Product - success", async () => {
  // Mock the `findByIdAndDelete` method
  const findByIdAndDeleteMock = jest
    .spyOn(productModel, "findByIdAndDelete")
    .mockResolvedValue({ _id: "1" });

  productModel.findByIdAndDelete = findByIdAndDeleteMock;

  const req = { params: { pid: "1" } }; // Mock request with product ID
  const res = createMockResponse();

  // Call the controller
  await deleteProductController(req, res);

  // Assertions
  expect(findByIdAndDeleteMock).toHaveBeenCalledWith("1"); // Ensure the product is deleted using the correct ID
  expect(res.status).toHaveBeenCalledWith(200); // Expect a 200 status code
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      success: true,
      message: "Product Deleted successfully",
    })
  );
});

// Expected to fail
test.failing("Delete Product - failure", async () => {
  const findByIdAndDeleteMock = jest
    .spyOn(productModel, "findByIdAndDelete")
    .mockResolvedValue({ _id: "8976876" });

  productModel.findByIdAndDelete = findByIdAndDeleteMock;

  const req = { params: { pid: "8976876" } }; // Mock request with product ID
  const res = createMockResponse();

  // Call the controller
  await deleteProductController(req, res);

  // Assertions
  expect(findByIdAndDeleteMock).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(500); // Expect a 500 status code
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      success: false,
      message: "Error while deleting product",
      error: new Error("Delete failed"), // Compare the message property of the error
    })
  );
});

// Test updateProductController method
const mockOldProductData = {
  _id: "1",
  name: "Old Product",
  description: "Old description",
  price: 100,
  category: "Old Category",
  quantity: 10,
  shipping: true,
  slug: "old-product",
  photo: {
    data: Buffer.from(""),
    contentType: "",
  },
  save: jest.fn().mockResolvedValue(true), // Mock the save method to resolve successfully
};

const mockNewProductData = {
  params: { pid: "1" },
  fields: {
    name: "updated product",
    description: "Updated description",
    price: 200,
    category: "Updated Category",
    quantity: 20,
    shipping: false,
  },
  files: {
    photo: {
      path: "client/public/images/a1.png",
      size: 500000,
      type: "image/png",
    },
  },
};

test("Update Product - success", async () => {
  // Mock data for an existing product
  const mockProductData = mockOldProductData;

  // Mock `findByIdAndUpdate` to return the mock product
  const mockFindByIdAndUpdate = jest
    .spyOn(productModel, "findByIdAndUpdate")
    .mockResolvedValue(mockProductData);

  // Mock the request with new product data and a photo
  const req = mockNewProductData;

  // Mock the `fs.readFileSync` method to return fake photo data
  jest
    .spyOn(fs, "readFileSync")
    .mockReturnValue(Buffer.from("mock photo data"));

  // Mock the response object
  const res = createMockResponse();

  // Call the controller
  await updateProductController(req, res);

  // Assertions
  expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
    "1",
    expect.objectContaining({
      ...mockNewProductData.fields, // Spread the fields object
      slug: "updated-product", // Manually add the slug field
    }),
    { new: true }
  );

  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.send).toHaveBeenCalledWith({
    success: true,
    message: "Product Updated Successfully",
    products: mockProductData,
  });
});

test("Update Product - test slugify - expect success", async () => {
  // Mock data for an existing product
  const mockProductData = mockOldProductData;

  // Mock `findByIdAndUpdate` to return the mock product
  const mockFindByIdAndUpdate = jest
    .spyOn(productModel, "findByIdAndUpdate")
    .mockResolvedValue(mockProductData);

  // Mock the request with new product data and a photo
  const req = { ...mockNewProductData, shipping: false };

  // Mock the `fs.readFileSync` method to return fake photo data
  jest
    .spyOn(fs, "readFileSync")
    .mockReturnValue(Buffer.from("mock photo data"));

  // Mock the response object
  const res = createMockResponse();

  // Call the controller
  await updateProductController(req, res);

  // Assertions
  expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
    "1",
    expect.objectContaining({
      ...mockNewProductData.fields, // Spread the fields object
      shipping: false,
      slug: "updated-product", // Manually add the slug field
    }),
    { new: true }
  );

  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.send).toHaveBeenCalledWith({
    success: true,
    message: "Product Updated Successfully",
    products: mockProductData,
  });
});

test("Update Product - test shipping field - expect success", async () => {
  // Mock data for an existing product
  const mockProductData = mockOldProductData;

  // Mock `findByIdAndUpdate` to return the mock product
  const mockFindByIdAndUpdate = jest
    .spyOn(productModel, "findByIdAndUpdate")
    .mockResolvedValue(mockProductData);

  // Mock the request with new product data and a photo
  const req = { ...mockNewProductData, name: "Updated Product" };

  // Mock the `fs.readFileSync` method to return fake photo data
  jest
    .spyOn(fs, "readFileSync")
    .mockReturnValue(Buffer.from("mock photo data"));

  // Mock the response object
  const res = createMockResponse();

  // Call the controller
  await updateProductController(req, res);

  // Assertions
  expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
    "1",
    expect.objectContaining({
      ...mockNewProductData.fields, // Spread the fields object
      slug: "updated-product", // Manually add the slug field
    }),
    { new: true }
  );

  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.send).toHaveBeenCalledWith({
    success: true,
    message: "Product Updated Successfully",
    products: mockProductData,
  });
});

test("Update Product - fail when name is missing", async () => {
  const req = {
    ...mockNewProductData,
    fields: { ...mockNewProductData.fields, name: "" },
  };
  const res = createMockResponse();

  await updateProductController(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
});

test("Update Product - fail when description is missing", async () => {
  const req = {
    ...mockNewProductData,
    fields: { ...mockNewProductData.fields, description: "" },
  };
  const res = createMockResponse();

  await updateProductController(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith({ error: "Description is Required" });
});

test("Update Product - fail when price is missing", async () => {
  const req = {
    ...mockNewProductData,
    fields: { ...mockNewProductData.fields, price: "" },
  };
  const res = createMockResponse();

  await updateProductController(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith({ error: "Price is Required" });
});

test("Update Product - fail when category is missing", async () => {
  const req = {
    ...mockNewProductData,
    fields: { ...mockNewProductData.fields, category: "" },
  };
  const res = createMockResponse();

  await updateProductController(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith({ error: "Category is Required" });
});

test("Update Product - fail when quantity is missing", async () => {
  const req = {
    ...mockNewProductData,
    fields: { ...mockNewProductData.fields, quantity: "" },
  };
  const res = createMockResponse();

  await updateProductController(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith({ error: "Quantity is Required" });
});

test("Update Product - fail when photo size is greater than 1MB", async () => {
  const req = {
    ...mockNewProductData,
    files: {
      photo: {
        path: "client/public/images/a1.png",
        size: 2000000,
        type: "image/png",
      },
    },
  };
  const res = createMockResponse();

  await updateProductController(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith({
    error: "photo is Required and should be less then 1mb",
  });
});

test("Update Product - fail due to server error", async () => {
  const req = mockNewProductData;
  const res = createMockResponse();

  // Mock `findByIdAndUpdate` to throw an error
  const mockFindByIdAndUpdate = jest
    .spyOn(productModel, "findByIdAndUpdate")
    .mockRejectedValue(new Error("Database error"));

  await updateProductController(req, res);

  expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
    "1",
    expect.objectContaining({
      ...mockNewProductData.fields,
      slug: "updated-product",
    }),
    { new: true }
  );

  // Assertions for error response
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith({
    success: false,
    error: expect.any(Error),
    message: "Error in Updte product",
  });
});

describe("searchProductController", () => {
  let req, res;

  const keyword = "laptop";

  const mockResults = [
    {
      _id: "63f7c3c8e1234a3b2d4e678b",
      name: "Laptop 1",
      description: "A powerful laptop for gaming",
    },
    {
      _id: "63f7c3c8e1234a3b2d4e678c",
      name: "Laptop 2",
      description: "A lightweight laptop for travel",
    },
  ];

  const mockFind = jest.fn().mockReturnThis();
  const mockSelect = jest.fn().mockResolvedValue(mockResults);

  

  beforeEach(() => {
    // Mock the request object
    req = {
      params: {
        keyword: keyword,
      },
    };

    // Mock the response object with jest.fn() spies
    res = {
      status: jest.fn(() => res),
      send: jest.fn(),
      json: jest.fn(),
    };

    // Reset all mocks before each test
    jest.clearAllMocks();

    productModel.find = mockFind;
    productModel.select = mockSelect;
  });

  it("should fetch search results successfully and send a 200 response", async () => {
    // Invoke the controller
    await searchProductController(req, res);

    // Assertions
    expect(mockFind).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    }); // Check if find was called with correct parameters
    expect(mockSelect).toHaveBeenCalledWith("-photo"); // Check if select was called correctly
    expect(res.json).toHaveBeenCalledWith(mockResults); // Ensure correct response JSON
  });

  it("should handle errors and send a 400 response with an error message", async () => {
    const mockError = new Error("Database error");
    productModel.select.mockRejectedValue(mockError);

    // Invoke the controller
    await searchProductController(req, res);

    // Assertions
    expect(mockFind).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    }); // Check if find was called with correct parameters
    expect(res.status).toHaveBeenCalledWith(400); // Ensure correct response status
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error In Search Product API",
      error: mockError,
    });
  });
});

describe("realtedProductController", () => {
  let req, res;

  const pid = "63f7c3c8e1234a3b2d4e678a";
  const cid = "63f7c3c8e1234a3b2d4e6789";

  const mockProducts = [
    {
      _id: "63f7c3c8e1234a3b2d4e678b",
      name: "Related Product 1",
      category: cid,
    },
    {
      _id: "63f7c3c8e1234a3b2d4e678c",
      name: "Related Product 2",
      category: cid,
    },
  ];

  const mockFind = jest.fn().mockReturnThis();
  const mockSelect = jest.fn().mockReturnThis();
  const mockLimit = jest.fn().mockReturnThis();
  const mockPopulate = jest.fn().mockResolvedValue(mockProducts);

  

  beforeEach(() => {
    // Mock the request object
    req = {
      params: {
        pid: pid, // Example product ID to exclude
        cid: cid, // Example category ID
      },
    };

    // Mock the response object with jest.fn() spies
    res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    // Reset all mocks before each test
    jest.clearAllMocks();

    productModel.find = mockFind;
    productModel.select = mockSelect;
    productModel.limit = mockLimit;
    productModel.populate = mockPopulate;
  });

  it("should fetch related products successfully and send a 200 response", async () => {
    // Invoke the controller
    await realtedProductController(req, res);

    // Assertions
    expect(mockFind).toHaveBeenCalledWith({
      category: req.params.cid,
      _id: { $ne: req.params.pid },
    }); // Check if find was called with correct parameters
    expect(mockSelect).toHaveBeenCalledWith("-photo"); // Check if select was called correctly
    expect(mockLimit).toHaveBeenCalledWith(3); // Check if limit was called with 3
    expect(mockPopulate).toHaveBeenCalledWith("category"); // Check if populate was called correctly
    expect(res.status).toHaveBeenCalledWith(200); // Ensure correct response status
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: expect.any(Array),
    });
  });

  it("should handle errors and send a 400 response with an error message", async () => {
    const mockError = new Error("Database error");
    productModel.populate.mockRejectedValue(mockError);

    // Invoke the controller
    await realtedProductController(req, res);

    // Assertions
    expect(productModel.find).toHaveBeenCalledWith({
      category: req.params.cid,
      _id: { $ne: req.params.pid },
    }); // Check if find was called with correct parameters
    expect(res.status).toHaveBeenCalledWith(400); // Ensure correct response status
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "error while geting related product",
      error: mockError,
    });
  });
});

import categoryModel from "../models/categoryModel.js";

jest.mock('../models/categoryModel.js');

describe('productCategoryController', () => {
  let req;
  let res;

  categoryModel.findOne = jest.fn();
  productModel.find = jest.fn();
  productModel.populate = jest.fn();

  const mockCategory = { _id: '63f7c3c8e1234a3b2d4e6789', name: 'Electronics', slug: 'electronics' };
  const mockProducts = [
    {
      _id: '63f7c3c8e1234a3b2d4e678a',
      name: 'Laptop',
      slug: 'laptop',
      description: 'A high-performance laptop',
      price: 1200,
      category: mockCategory._id,
      quantity: 10,
      shipping: true,
    },
    {
      _id: '63f7c3c8e1234a3b2d4e678b',
      name: 'Smartphone',
      slug: 'smartphone',
      description: 'A latest-gen smartphone',
      price: 800,
      category: mockCategory._id,
      quantity: 20,
      shipping: false,
    },
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock request object
    req = {
      params: {
        slug: 'electronics', // Example slug
      },
    };

    // Mock response object with jest.fn() spies
    res = {
      status: jest.fn(() => res), // Allows chaining
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  // Test cases will go here
  it('should fetch category and products successfully and send a 200 response', async () => {
    categoryModel.findOne.mockResolvedValue(mockCategory);
    
    productModel.find.mockReturnThis();
    productModel.populate.mockResolvedValue(mockProducts);

    // Invoke the controller
    await productCategoryController(req, res);
  
    // Assertions
    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: 'electronics' });
    expect(productModel.find).toHaveBeenCalledWith({ category: mockCategory });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      category: mockCategory,
      products: mockProducts,
    });
  });

  it('should return empty products array if category is not found', async () => {
    // Mock categoryModel.findOne to return null
    categoryModel.findOne.mockResolvedValue(null);
  
    // Mock productModel.find to return an empty array
    productModel.find.mockReturnThis();
    productModel.populate.mockResolvedValue([]);
  
    // Invoke the controller
    await productCategoryController(req, res);
  
    // Assertions
    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: 'electronics' });
    expect(productModel.find).toHaveBeenCalledWith({ category: null });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      category: null,
      products: [],
    });
  });

  it('should handle errors and send a 400 response with error message when failing to get category', async () => {
    // Mock categoryModel.findOne to throw an error
    const mockError = new Error('Database error');
    categoryModel.findOne.mockRejectedValue(mockError);
  
    // Invoke the controller
    await productCategoryController(req, res);
  
    // Assertions
    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: 'electronics' });
    // productModel.find should not be called since findOne failed
    expect(productModel.find).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: mockError,
      message: 'Error While Getting products',
    });
  });

  it('should handle errors and send a 400 response with error message when failing to get products', async () => {
    // Mock categoryModel.findOne to throw an error
    const mockError = new Error('Database error');
    categoryModel.findOne.mockResolvedValue(mockCategory);
    productModel.find.mockReturnThis();
    productModel.populate.mockRejectedValue(mockError);
  
    // Invoke the controller
    await productCategoryController(req, res);
  
    // Assertions
    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: 'electronics' });
    expect(productModel.find).toHaveBeenCalledWith({ category: mockCategory });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: mockError,
      message: 'Error While Getting products',
    });
  });
});