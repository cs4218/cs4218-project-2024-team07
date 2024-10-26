import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Category from '../models/categoryModel.js';
import User from '../models/userModel.js';
import { faker } from '@faker-js/faker';
import slugify from 'slugify';
import dotenv from 'dotenv';
import app from '../server.js';
import request from 'supertest';


dotenv.config();

let mongoServer;
let token;
const uniqueCategoryNames = new Set();

const testUser = {
    "name" : "Tester",
    "email" : "test@u.nus.edu",
    "password" : "$2b$10$iPKu8TJnB75Fz15SsRhIN.fgxCTJwtmUnIjwaSHZTVpx0jRp4f4RW",
    "phone" : "12345678",
    "address" : "JB Central Mall",
    "answer" : "Badminton",
    "role" : 1
}


// Create unique fake category
function createFakeCategory() {
    let categoryName;
    do {
        categoryName = faker.commerce.department();
    } while (uniqueCategoryNames.has(categoryName));
    
    uniqueCategoryNames.add(categoryName);
    
    return {
        name: categoryName,
        slug: slugify(categoryName)
    };
}

// Create a fake Category DB so as to avoid modifying the real DB
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create a test user
    await User.create(testUser);

    const fakeCategories = Array.from({ length: 10 }, createFakeCategory);
    await Category.insertMany(fakeCategories);

    // Get token 
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@u.nus.edu', 
        password: 'testing123!', 
        });

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.token).toBeDefined();
    token = loginResponse.body.token;

    
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});


test("/create-category", async () => {
    const response = await request(app)
        .post("/api/v1/category/create-category")
        .send({
            name: "New Test Category"
        })
        .set('Authorization', token);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("new category created");
});

test("/update-category/:id", async () => {
    const category = await Category.findOne({ name: "New Test Category" });
    expect(category).toBeDefined();
    const response = await request(app)
        .put(`/api/v1/category/update-category/${category._id}`)
        .send({
            name: "Updated Test Category"
        })
        .set('Authorization', token);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    // Note that there is a typo in message field in updateCategoryController
    expect(response.body.messsage).toBe("Category Updated Successfully");
});

test("/get-category", async () => {
    const response = await request(app)
        .get("/api/v1/category/get-category")

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("All Categories List");
    expect(response.body.category).toBeDefined();
    expect(response.body.category.length).toBe(11);
});

test("/single-category/:slug", async () => {
    const categorySlug = slugify("Updated Test Category");
    const response = await request(app)
        .get(`/api/v1/category/single-category/${categorySlug}`)

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Get SIngle Category SUccessfully");
    expect(response.body.category).toBeDefined();
    expect(response.body.category.name).toBe("Updated Test Category");
});

test("/delete-category/:id", async () => {
    const category = await Category.findOne({ name: "Updated Test Category" });
    expect(category).toBeDefined();
    const response = await request(app)
        .delete(`/api/v1/category/delete-category/${category._id}`)
        .set('Authorization', token);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    // Note that there is a typo in message field output clein deleteCategoryCOntroller
    expect(response.body.message).toBe("Categry Deleted Successfully");
});