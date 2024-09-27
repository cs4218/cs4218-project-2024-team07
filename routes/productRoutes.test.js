import { jest } from "@jest/globals";
import { hashPassword } from "../helpers/authHelper";
import mongoose from "mongoose";
import dotenv from "dotenv";
import request from "supertest";
import app from "../server.js";
import jwt from "jsonwebtoken";
import * as productController from "../controllers/productController.js";
import formidable from "express-formidable";
import { log } from "console";

dotenv.config();

jest.mock("../middlewares/authMiddleware", () => ({
  requireSignIn: jest.fn((req, res, next) => {
    req.user = { id: "testUserId" };
    next();
  }),
  isAdmin: jest.fn((req, res, next) => next()),
}));
jest.mock("../controllers/productController.js", () => ({
  createProductController: jest.fn((req, res) =>
    res.status(201).json({ message: "Product created successfully" })
  ),
}));
jest.mock("express-formidable", () =>
  jest.fn(() => (req, res, next) => {
    req.fields = {
      name: "Test Product",
      description: "A test product description",
      price: 100,
      category: "Test Category",
      quantity: 10,
    };
    req.files = {
      image: {
        filepath: "/mock/path/to/file.jpg",
        originalFilename: "mockFile.jpg",
        mimetype: "image/jpeg",
        size: 12345,
      },
    };
    next();
  })
);
jest.mock("../controllers/productController", () => ({
  createProductController: jest.fn(),
}));

const connectWithRetry = async (retries = 10, delay = 5000) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to MongoDB");
      return;
    } catch (error) {
      attempt++;
      console.log(
        `Attempt ${attempt} failed. Retrying in ${delay / 1000} seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Failed to connect to MongoDB after maximum retries");
};

jest.setTimeout(200000);

beforeAll(async () => {
  await connectWithRetry();
});

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

describe("Product Routes successful calls", () => {
  let req, res;
  beforeEach(async () => {
    req = {
      body: {
        name: "Test Product",
        description: "A test product description",
        price: 100,
        category: "Test Category",
        quantity: 10,
      },
      params: { pid: "12345" },
      files: {
        image: {
          filepath: "/path/to/mock/file.jpg",
          originalFilename: "file.jpg",
          mimetype: "image/jpeg",
          size: 12345,
        },
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  // POST /create-product
  it("Check existence of (POST /create-product)", async () => {
    // const mockImageBuffer = Buffer.from("Mock image");
    const response = await request(app)
      .post("/api/v1/product/create-product")
      .set("Content-Type", "multipart/form-data")
      .set("authorization", process.env.TEST_AUTH_TOKEN);
    // .field("name", "Test Product")
    // .field("description", "A test product description")
    // .field("price", "100")
    // .field("category", "Test Category")
    // .field("quantity", "10")
    // .attach("image", mockImageBuffer, 'mock-image.jpeg')

    expect(response.status).toBe(500);
  });

  // PUT /update-product/:pid
//   it("should update a product (PUT /update-product/:pid)", async () => {
//     const productId = "12345";
//     const response = await request(app)
//       .post(`/api/v1/update-product/${productId}`)
//       .set("Content-Type", "multipart/form-data")
//       .set("authorization", process.env.TEST_AUTH_TOKEN);

//     expect(response.status).toBe(200);
//   });

//   // GET /get-product
//   it("should get products (GET /get-product)", async () => {
//     const response = await request(app).get("/get-product");

//     expect(response.status).toBe(200);
//     expect(response.body.products).toEqual([]);
//     expect(productController.getProductController).toHaveBeenCalled();
//   });

//   // GET /get-product/:slug
//   it("should get a single product by slug (GET /get-product/:slug)", async () => {
//     const response = await request(app).get("/get-product/test-slug");

//     expect(response.status).toBe(200);
//     expect(response.body.product).toEqual({});
//     expect(productController.getSingleProductController).toHaveBeenCalled();
//   });

//   // GET /product-photo/:pid
//   it("should get product photo (GET /product-photo/:pid)", async () => {
//     const response = await request(app).get("/product-photo/1");

//     expect(response.status).toBe(200);
//     expect(response.text).toBe("Photo");
//     expect(productController.productPhotoController).toHaveBeenCalled();
//   });

//   // DELETE /delete-product/:pid
//   it("should delete a product (DELETE /delete-product/:pid)", async () => {
//     const response = await request(app).delete("/delete-product/1");

//     expect(response.status).toBe(204);
//     expect(productController.deleteProductController).toHaveBeenCalled();
//   });

//   // POST /product-filters
//   it("should filter products (POST /product-filters)", async () => {
//     const response = await request(app)
//       .post("/product-filters")
//       .send({ category: "electronics" });

//     expect(response.status).toBe(200);
//     expect(response.body.filteredProducts).toEqual([]);
//     expect(productController.productFiltersController).toHaveBeenCalled();
//   });

//   // GET /product-count
//   it("should get product count (GET /product-count)", async () => {
//     const response = await request(app).get("/product-count");

//     expect(response.status).toBe(200);
//     expect(response.body.count).toBe(10);
//     expect(productController.productCountController).toHaveBeenCalled();
//   });

//   // GET /product-list/:page
//   it("should get product list by page (GET /product-list/:page)", async () => {
//     const response = await request(app).get("/product-list/1");

//     expect(response.status).toBe(200);
//     expect(response.body.products).toEqual([]);
//     expect(productController.productListController).toHaveBeenCalled();
//   });

//   // GET /search/:keyword
//   it("should search products (GET /search/:keyword)", async () => {
//     const response = await request(app).get("/search/test");

//     expect(response.status).toBe(200);
//     expect(response.body.searchResults).toEqual([]);
//     expect(productController.searchProductController).toHaveBeenCalled();
//   });

//   // GET /related-product/:pid/:cid
//   it("should get related products (GET /related-product/:pid/:cid)", async () => {
//     const response = await request(app).get("/related-product/1/1");

//     expect(response.status).toBe(200);
//     expect(response.body.relatedProducts).toEqual([]);
//     expect(productController.realtedProductController).toHaveBeenCalled();
//   });

//   // GET /product-category/:slug
//   it("should get products by category (GET /product-category/:slug)", async () => {
//     const response = await request(app).get("/product-category/test-category");

//     expect(response.status).toBe(200);
//     expect(response.body.categoryProducts).toEqual([]);
//     expect(productController.productCategoryController).toHaveBeenCalled();
//   });

//   // GET /braintree/token
//   it("should get braintree token (GET /braintree/token)", async () => {
//     const response = await request(app).get("/braintree/token");

//     expect(response.status).toBe(200);
//     expect(response.body.token).toBe("123");
//     expect(productController.braintreeTokenController).toHaveBeenCalled();
//   });

//   // POST /braintree/payment
//   it("should process braintree payment (POST /braintree/payment)", async () => {
//     const response = await request(app)
//       .post("/braintree/payment")
//       .set("Content-Type", "application/json")
//       .send({ paymentMethodNonce: "fake-nonce", amount: 100 });

//     expect(response.status).toBe(200);
//     expect(response.body.success).toBe(true);
//     expect(productController.brainTreePaymentController).toHaveBeenCalled();
//   });
// });

// describe("Inappropriate CRUD operations on API", () => {
//   it("should fail to POST to /get-product (405 Method Not Allowed)", async () => {
//     const response = await request(app).post("/get-product");

//     expect(response.status).toBe(405); // Expected response for unsupported methods
//     expect(response.body.message).toBe("Method Not Allowed");
//   });

//   // PUT /get-product (should not allow PUT method)
//   it("should fail to PUT to /get-product (405 Method Not Allowed)", async () => {
//     const response = await request(app).put("/get-product");

//     expect(response.status).toBe(405); // Expected response for unsupported methods
//     expect(response.body.message).toBe("Method Not Allowed");
//   });

//   // DELETE /get-product (should not allow DELETE method)
//   it("should fail to DELETE to /get-product (405 Method Not Allowed)", async () => {
//     const response = await request(app).delete("/get-product");

//     expect(response.status).toBe(405); // Expected response for unsupported methods
//     expect(response.body.message).toBe("Method Not Allowed");
//   });
});

afterAll(async () => {
  await mongoose.connection.close();
});
