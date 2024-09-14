import { jest } from '@jest/globals';
import { createCategoryController, 
        updateCategoryController, 
        categoryControlller, 
        singleCategoryController, 
        deleteCategoryCOntroller } from './categoryController';

import categoryModel from '../models/categoryModel';
import slugify from 'slugify';

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Create Category Controller", () => {
    test('Create new category without a name', async () => {
        // Missing name in body of request
        const req = {body: {}};
        const res = {status: jest.fn().mockReturnThis(), send: jest.fn()};
        await createCategoryController(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({ message: "Name is required"});
    });

    test('Create new category with existing category', async () => {
        // Mocking the findOne method of categoryModel
        const findOneMock = jest.spyOn(categoryModel, 'findOne').mockResolvedValue({
            name: 'existingCategory'
        });

        const req = {body: {'name': 'existingCategory'}};
        const res = {status: jest.fn().mockReturnThis(), send: jest.fn()};
        await createCategoryController(req, res);

        expect(findOneMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({success: true, message: "Category Already Exisits"});
    });
    
    test('Create new category without existing category', async () => {
        // Mocking the findOne method of categoryModel
        const findOneMock = jest.spyOn(categoryModel, 'findOne').mockResolvedValue(null);
        // Mocking the save method of categoryModel
        const saveMock = jest.fn().mockResolvedValue({
            name: 'newCategory',
            slug: slugify('newCategory')
        });
        jest.spyOn(categoryModel.prototype, 'save').mockImplementation(saveMock);

        const req = {body: {'name': 'newCategory'}};
        const res = {status: jest.fn().mockReturnThis(), send: jest.fn()};
        await createCategoryController(req, res);

        expect(findOneMock).toHaveBeenCalled();
        expect(saveMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith({success: true, message: "new category created", category: {name: 'newCategory', slug: slugify('newCategory')}});
    });

    // Slugify function is used to test whether name is integer or not ???
    test('Create new category with an integer name', async () => {
        const req = {body: {'name': 12345678}};
        const res = {status: jest.fn().mockReturnThis(), send: jest.fn()};
        await createCategoryController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: "Errro in Category"
        }));
        
    });
});

describe("Update Category Controller", () => {
    test('Update category with an existing ID', async () => {
        // Mocking the findByIdAndUpdate method of categoryModel
        const findByIdAndUpdateMock = jest.spyOn(categoryModel, 'findByIdAndUpdate').mockResolvedValue({
            name: 'updatedCategory',
            slug: slugify('updatedCategory')
        });

        const req = {body: {'name': 'updatedCategory'}, params: {id: '1'}};
        const res = {status: jest.fn().mockReturnThis(), send: jest.fn()};
        await updateCategoryController(req, res);

        expect(findByIdAndUpdateMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({success: true, messsage: "Category Updated Successfully", category: {name: 'updatedCategory', slug: slugify('updatedCategory')}});
    });

    test('Update category with an non-existent ID', async () => {
        // Mocking the findByIdAndUpdate method of categoryModel and throwing an error???
        const findByIdAndUpdateMock = jest.spyOn(categoryModel, 'findByIdAndUpdate').mockRejectedValue(new Error('Update failed'));

        const req = {body: {'name': 'nonExistentUpdatedCategory'}, params: {id: '2'}};
        const res = {status: jest.fn().mockReturnThis(), send: jest.fn()};
        await updateCategoryController(req, res);

        expect(findByIdAndUpdateMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: "Error while updating category"
        }));
    });
});

describe("Get All Categories Controller", () => {
    test('Get all categories', async () => {
        // Mocking the find method of categoryModel
        const findMock = jest.spyOn(categoryModel, 'find').mockResolvedValue([
            {name: 'category1', slug: slugify('category1')},
            {name: 'category2', slug: slugify('category2')}
        ]);

        const req = {};
        const res = {status: jest.fn().mockReturnThis(), send: jest.fn()};
        await categoryControlller(req, res);

        expect(findMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({success: true, message: "All Categories List", category: [{name: 'category1', slug: slugify('category1')}, {name: 'category2', slug: slugify('category2')}]});
    });

    test('Get all categories with error', async () => {
        // Mocking the find method of categoryModel and throwing an error???
        const findMock = jest.spyOn(categoryModel, 'find').mockRejectedValue(new Error('Get all categories failed'));

        const req = {};
        const res = {status: jest.fn().mockReturnThis(), send: jest.fn()};
        await categoryControlller(req, res);

        expect(findMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: "Error while getting all categories"
        }));
    });
});

describe("Get Single Category Controller", () => {
    test('Get single category with an existing slug', async () => {
        // Mocking the findOne method of categoryModel
        const findOneMock = jest.spyOn(categoryModel, 'findOne').mockResolvedValue({
            name: 'singleCategory',
            slug: slugify('singleCategory')
        });

        const req = {params: {slug: slugify('singleCategory')}};
        const res = {status: jest.fn().mockReturnThis(), send: jest.fn()};
        await singleCategoryController(req, res);

        expect(findOneMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({success: true, message: "Get SIngle Category SUccessfully", category: {name: 'singleCategory', slug: slugify('singleCategory')}});
    });

    test('Get single category with error', async () => {
        // Mocking the findOne method of categoryModel and returning null???
        const findOneMock = jest.spyOn(categoryModel, 'findOne').mockRejectedValue(new Error('Get single category failed'));

        const req = {params: {slug: slugify('failedSingleCategory')}};
        const res = {status: jest.fn().mockReturnThis(), send: jest.fn()};
        await singleCategoryController(req, res);

        expect(findOneMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: "Error While getting Single Category"
        }));
    });
});

describe("Delete Category Controller", () => {
    test('Delete category with an existing ID', async () => {
        // Mocking the findByIdAndDelete method of categoryModel
        const findByIdAndDeleteMock = jest.spyOn(categoryModel, 'findByIdAndDelete').mockResolvedValue({
            name: 'deletedCategory',
            slug: slugify('deletedCategory')
        });

        const req = {params: {id: '3'}};
        const res = {status: jest.fn().mockReturnThis(), send: jest.fn()};
        await deleteCategoryCOntroller(req, res);

        expect(findByIdAndDeleteMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({success: true, message: "Categry Deleted Successfully"});
    });

    test('Delete single category with non-existing ID', async () => {
        // Mocking the findOne method of categoryModel and returning null???
        const findByIdAndDeleteMock = jest.spyOn(categoryModel, 'findByIdAndDelete').mockRejectedValue(new Error('Delete failed'));

        const req = {params: {id: '4'}};
        const res = {status: jest.fn().mockReturnThis(), send: jest.fn()};
        await deleteCategoryCOntroller(req, res);

        expect(findByIdAndDeleteMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: "error while deleting category"
        }));
    });
});