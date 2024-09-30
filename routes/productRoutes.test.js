import { jest } from "@jest/globals";
import { hashPassword } from "../helpers/authHelper";
import mongoose from "mongoose";
import dotenv from "dotenv";
import request from "supertest";
import app from "../server.js";
import * as productController from "../controllers/productController.js";
import formidable from "express-formidable";

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
});

afterAll(async () => {
  await mongoose.connection.close();
});
