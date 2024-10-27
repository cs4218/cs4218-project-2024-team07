import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import User from "../models/userModel.js";
import { faker } from "@faker-js/faker";
import slugify from "slugify";
import dotenv from "dotenv";
import app from "../server.js";
import request from "supertest";
import FormData from "form-data";

dotenv.config();

let mongoServer;
let token;
let category;
const uniqueProductNames = new Set();
const uniqueCategoryNames = new Set();

const testUser = {
  name: "Tester",
  email: "test@u.nus.edu",
  password: "$2b$10$iPKu8TJnB75Fz15SsRhIN.fgxCTJwtmUnIjwaSHZTVpx0jRp4f4RW",
  phone: "12345678",
  address: "JB Central Mall",
  answer: "Badminton",
  role: 1,
};

function createFakeCategory() {
  let categoryName;
  do {
    categoryName = faker.commerce.department();
  } while (uniqueCategoryNames.has(categoryName));

  uniqueCategoryNames.add(categoryName);

  return {
    name: categoryName,
    slug: slugify(categoryName),
  };
}

async function createFakeProduct() {
  let productName;
  do {
    // Unique product name
    productName = faker.commerce.department();
  } while (uniqueProductNames.has(productName));

  uniqueProductNames.add(productName);

  const categoryName = uniqueCategoryNames.values().next().value;
  category = await Category.findOne({ name: categoryName });

  return {
    name: productName,
    slug: slugify(productName),
    description: "product description", 
    price: 10,
    category: category,
    quantity: 100,
    photo: Buffer.from(faker.image.dataUri(200, 200), "base64"),
    shipping: true,
  };
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await User.create(testUser);

  // create a fake category first
  const fakeCategory = createFakeCategory();
  await Category.insertMany(fakeCategory);

  // create 10 fake products
  const fakeProducts = await Promise.all(
    Array.from({ length: 10 }, async () => await createFakeProduct())
  );

  await Product.insertMany(fakeProducts);

  const loginResponse = await request(app).post("/api/v1/auth/login").send({
    email: "test@u.nus.edu",
    password: "testing123!",
  });

  expect(loginResponse.statusCode).toBe(200);
  expect(loginResponse.body.token).toBeDefined();
  token = loginResponse.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Test for Create Product
test("/create-product", async () => {
  const product = await createFakeProduct();
  expect(product).toBeDefined();

  const productPhotoBuffer = Buffer.from(
    faker.image.dataUri(200, 200).split(",")[1],
    "base64"
  );

  const response = await request(app)
    .post(`/api/v1/product/create-product`)
    .set("Authorization", token)
    .field("name", product.name)
    .field("description", product.description)
    .field("price", product.price)
    .field("quantity", product.quantity)
    .field("category", product.category._id.toString())
    .attach("photo", productPhotoBuffer, "photo.jpg");
  
  uniqueProductNames.add(product.name);

  expect(response.statusCode).toBe(201); // Adjust based on your controller's response
  expect(response.body).toHaveProperty('success', true); // Check for a success response

});

// Test for Get Products
test('/get-product', async () => {
  const response = await request(app).get('/api/v1/product/get-product');

  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty('products'); // Adjust based on your response structure
  expect(Array.isArray(response.body.products)).toBe(true);
});

// Test for Single Product
test('/get-product/:slug', async () => {
  const productName = uniqueProductNames.values().next().value;
  const product = await Product.findOne({ name: productName });
  expect(product).toBeDefined();

  const slug = product.slug;
  const response = await request(app).get(`/api/v1/product/get-product/${slug}`);
  console.log('Response:', response);
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty('product');
  expect(response.body.product).toHaveProperty('slug', slug);
});

test('/product-category/:slug', async () => {
  const categoryName = uniqueCategoryNames.values().next().value;
  const category = await Category.findOne({ name: categoryName });
  expect(category).toBeDefined();

  const slug = category.slug;
  const response = await request(app).get(`/api/v1/product/product-category/${slug}`);

  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty('success', true);
  expect(response.body).toHaveProperty('products');
  expect(Array.isArray(response.body.products)).toBe(true);
  expect(response.body.products.length).toBeGreaterThan(0); // Adjust if necessary based on your controller's response
  expect(response.body.products[0].category._id.toString()).toBe(category._id.toString());
});

// Test for Delete Product
test('/delete-product/:pid', async () => {
  const productName = uniqueProductNames.values().next().value;
  const product = await Product.findOne({ name: productName });
  expect(product).toBeDefined();

  const response = await request(app).delete(`/api/v1/product/delete-product/${product._id}`);
  uniqueProductNames.delete(product.name);

  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty('success', true); // Adjust based on your controller's response
});


test("/update-product/:pid", async () => {
  const productName = uniqueProductNames.values().next().value;
  const product = await Product.findOne({ name: productName });
  expect(product).toBeDefined();

  const productPhotoBuffer = Buffer.from(
    faker.image.dataUri(200, 200).split(",")[1],
    "base64"
  );
  const response = await request(app)
    .put(`/api/v1/product/update-product/${product._id}`)
    .set("Authorization", token)
    .field("name", "Updated product name")
    .field("description", product.description)
    .field("price", product.price)
    .field("quantity", product.quantity)
    .field("category", product.category._id.toString())
    .attach("photo", productPhotoBuffer, "photo.jpg");

  uniqueProductNames.delete(product.name);
  uniqueProductNames.add("Updated product name");

  expect(response.statusCode).toBe(201);
  expect(response.body.success).toBe(true);
  expect(response.body.message).toBe("Product Updated Successfully");
});

test("/product-count", async () => {
  const response = await request(app).get(`/api/v1/product/product-count`);

  expect(response.statusCode).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.total).toBe(10);
});

test("/product-list/:page", async () => {
  const page = 1;
  const response = await request(app).get(
    `/api/v1/product/product-list/${page}`
  );

  expect(response.statusCode).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.products).toBeDefined();
  expect(response.body.products.length).toBe(6); // first page only
});

test("/product-filters", async () => {
  const response = await request(app)
    .post(`/api/v1/product/product-filters`)
    .send({
      checked: [],
      radio: [0, 19],
    });

  expect(response.statusCode).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.products).toBeDefined();
  // all prices are 10 for 10 products
  expect(response.body.products.length).toBe(10);
});

test("/search/:keyword", async () => {
  const keyword = "Updated%20product%20name";
  const response = await request(app).get(`/api/v1/product/search/${keyword}`);

  expect(response.statusCode).toBe(200);
  const results = response.body;
  expect(results).toBeDefined();
  expect(Array.isArray(results)).toBe(true);
  expect(results.length).toBeGreaterThan(0);
});
