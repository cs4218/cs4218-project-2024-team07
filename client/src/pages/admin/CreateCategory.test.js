import React from 'react';
import { render, screen, fireEvent, waitFor, within, waitForElementToBeRemoved } from '@testing-library/react';
import CreateCategory from './CreateCategory';
import axios from 'axios';
import toast from 'react-hot-toast';
import slugify from 'slugify';

jest.mock('axios');
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock('./../../components/Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('./../../components/AdminMenu', () => () => <div>AdminMenu</div>);
jest.mock('./../../components/Form/CategoryForm', () => ({ handleSubmit, value, setValue }) => (
  <form onSubmit={handleSubmit}>
    <input
      placeholder="Enter Category Name"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
    <button type="submit">Submit</button>
  </form>
));

const setupCreateCategory = () => {
  const mockGetCategories = {
    data: {
      success: true,
      message: 'All Categories List',
      category: [{ _id: 1, name: 'Electronics', slug: slugify('Electronics') }],
    },
  };
  axios.get.mockResolvedValueOnce(mockGetCategories);
  render(<CreateCategory />);
};

const setupCreateCategoryWithMultipleCategories = () => {
  const mockGetCategories = {
    data: {
      success: true,
      message: 'All Categories List',
      category: [
        { _id: 2, name: 'Bread', slug: slugify('Bread') },
        { _id: 3, name: 'Butter', slug: slugify('Butter') },
      ],
    },
  };
  axios.get.mockResolvedValueOnce(mockGetCategories);
  render(<CreateCategory />);
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('getAllCategory', () => {
  test('getAllCategory on component mount', async () => {
    setupCreateCategory();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
    });
    const categoryElement = await screen.findByText('Electronics');
    expect(categoryElement).toBeInTheDocument();
  });

  // Error message should be shown if the API call fails
  test('getAllCategory displays error toast when an error occurs', async () => {
    const mockGetCategories = {
      data: {
        success: false,
        message: "Error while getting all categories",
      },
    };
    axios.get.mockResolvedValueOnce(mockGetCategories);
    render(<CreateCategory />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
    });

    expect(toast.error).toHaveBeenCalledWith("Something wwent wrong in getting catgeory");
  });


  test('getAllCategory displays error toast when an exception occurs', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'));
    render(<CreateCategory />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
    });
    expect(toast.error).toHaveBeenCalledWith('Something wwent wrong in getting catgeory');
  });
});

describe('handleSubmit', () => {
  test('handleSubmit creates a new category with success', async () => {
    setupCreateCategory();
    const mockPostResponse = { data: { success: true, message: "new category created", category: [{ __id: 2, name: 'Books', slug: slugify('Books') }]} };
    axios.post.mockResolvedValueOnce(mockPostResponse);

    const mockGetCategories = {
      data: { success: true, message: "All Categories List", category: [{ _id: 1, name: 'Electronics', slug: slugify('Electronics') }, { __id: 2, name: 'Books', slug: slugify('Books') }] },
    };
    axios.get.mockResolvedValueOnce(mockGetCategories);


    const input = screen.getByPlaceholderText('Enter Category Name');
    const button = screen.getByText('Submit');
    fireEvent.change(input, { target: { value: 'Books' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/v1/category/create-category',
        { name: 'Books' }
      );
    });
    expect(toast.success).toHaveBeenCalledWith('Books is created');
    const categoryElement = await screen.findByText('Books');
    expect(categoryElement).toBeInTheDocument();
  });

  // Additional test case on frontend validation for missing category name
  test('handleSubmit cannot create a category due to missing category name', async () => {
    setupCreateCategory();

    // Submit the form without entering a category name
    const button = screen.getByText('Submit');
    fireEvent.click(button);

    await waitFor(() => {
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  // Additional test case on frontend validation for duplicate category name
  test('handleSubmit invalidates a duplicate category name with multiple categories', async () => {
    setupCreateCategoryWithMultipleCategories();

    const input = screen.getByPlaceholderText('Enter Category Name');
    const button = screen.getByText('Submit');
    fireEvent.change(input, { target: { value: 'Bread' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(axios.post).not.toHaveBeenCalled();
    });
    expect(toast.error).toHaveBeenCalledWith('Category Already Exisits');
  });

  test('handleSubmit creates a new category with error due to failed POST request', async () => {
    setupCreateCategory();
    const mockPostResponse = { data: { success: false, message: "Errro in Category"} };
    axios.post.mockResolvedValueOnce(mockPostResponse);
  
    const input = screen.getByPlaceholderText('Enter Category Name');
    const button = screen.getByText('Submit');
    fireEvent.change(input, { target: { value: 'E-books' } });
    fireEvent.click(button);
  
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/v1/category/create-category',
        { name: 'E-books' }
      );
    });
  
    expect(toast.error).toHaveBeenCalledWith("Errro in Category");
  });

  test('handleSubmit displays error toast when an exception occurs during category creation', async () => {
    setupCreateCategory();

    axios.post.mockRejectedValueOnce(new Error("Network error"));
  
    const input = screen.getByPlaceholderText('Enter Category Name');
    const button = screen.getByText('Submit');
    fireEvent.change(input, { target: { value: 'Manga' } });
    fireEvent.click(button);
  
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/v1/category/create-category',
        { name: 'Manga' }
      );
    });
  
    expect(toast.error).toHaveBeenCalledWith('somthing went wrong in input form');
  });
});

describe('handleUpdate', () => {
  test('handleUpdate updates a category', async () => {
    setupCreateCategory();
    const mockGetResponse = {
      data: {
        success: true,
        category: [{ _id: '1', name: 'Food', slug: slugify('Food') }],
      },
    };
    axios.get.mockResolvedValueOnce(mockGetResponse);
    const mockPutResponse = { data: { success: true, messsage: "Category Updated Successfully", category: [{ _id: '1', name: 'Food', slug: slugify('Food') }]} };
    axios.put.mockResolvedValueOnce(mockPutResponse);

    const editButton = await screen.findByText('Edit');
    fireEvent.click(editButton);

    const modal = await screen.findByRole('dialog');
    const modalContent = within(modal);
    const modalInput = modalContent.getByPlaceholderText('Enter Category Name');
    fireEvent.change(modalInput, { target: { value: 'Food' } });
    const modalSubmitButton = modalContent.getByText('Submit');
    fireEvent.click(modalSubmitButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        '/api/v1/category/update-category/1',
        { name: 'Food' }
      );
    });
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
    });
    expect(toast.success).toHaveBeenCalledWith('Food is updated');
  });

  test('handleUpdate updates a new category with error due to failed PUT request', async () => {
    setupCreateCategory();
    const mockPutResponse = { data: { success: false, message: "Error while updating category"} };
    axios.put.mockResolvedValueOnce(mockPutResponse);

    const editButton = await screen.findByText('Edit');
    fireEvent.click(editButton);
    const modal = await screen.findByRole('dialog');
    const modalContent = within(modal);
    const modalInput = modalContent.getByPlaceholderText('Enter Category Name');
    fireEvent.change(modalInput, { target: { value: 'Vegetables' } });
    const modalSubmitButton = modalContent.getByText('Submit');
    fireEvent.click(modalSubmitButton);
  
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        '/api/v1/category/update-category/1',
        { name: 'Vegetables' }
      );
    });

    expect(toast.error).toHaveBeenCalledWith('Error while updating category');
  });

  test('handleUpdate updates a duplicate category inside multiple categories', async () => {
    setupCreateCategoryWithMultipleCategories();

    const editButtons = await screen.findAllByText('Edit');
    fireEvent.click(editButtons[1]);
    const modal = await screen.findByRole('dialog');
    const modalContent = within(modal);
    const modalInput = modalContent.getByPlaceholderText('Enter Category Name');
    fireEvent.change(modalInput, { target: { value: 'Bread' } });
    const modalSubmitButton = modalContent.getByText('Submit');
    fireEvent.click(modalSubmitButton);

    await waitFor(() => {
      expect(axios.put).not.toHaveBeenCalled();
    });
    expect(toast.error).toHaveBeenCalledWith('Category Already Exisits');

  });

  test('handleUpdate displays error toast when an exception occurs during category update', async () => {
    setupCreateCategory();
    axios.put.mockRejectedValueOnce(new Error("Network error"));
  
    const editButton = await screen.findByText('Edit');
    fireEvent.click(editButton);
    const modal = await screen.findByRole('dialog');
    const modalContent = within(modal);
    const modalInput = modalContent.getByPlaceholderText('Enter Category Name');
    fireEvent.change(modalInput, { target: { value: 'Fruits' } });
    const modalSubmitButton = modalContent.getByText('Submit');
    fireEvent.click(modalSubmitButton);
  
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        '/api/v1/category/update-category/1',
        { name: 'Fruits' }
      );
    });
  
    expect(toast.error).toHaveBeenCalledWith('Somtihing went wrong');
  });
});

describe('handleDelete', () => {
  test('handleDelete deletes a category', async () => {
    setupCreateCategory();

    const mockDeleteResponse = { data: { success: true } };
    axios.delete.mockResolvedValueOnce(mockDeleteResponse);
    const mockGetResponse = {
      data: {
        success: true,
        message: 'All Categories List',
        category: [],
      },
    };
    axios.get.mockResolvedValueOnce(mockGetResponse);

    const deleteButton = await screen.findByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        '/api/v1/category/delete-category/1'
      );
    });
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
    });
    expect(toast.success).toHaveBeenCalledWith('category is deleted');
    await waitForElementToBeRemoved(() => screen.queryByText('Electronics'));
    expect(screen.queryByText('Electronics')).not.toBeInTheDocument();
  });

  test('handleDelete deletes a category with error due to failed DELETE request', async () => {
    setupCreateCategory();
    const mockDeleteResponse = { data: { success: false, message: "error while deleting category"} };
    axios.delete.mockResolvedValueOnce(mockDeleteResponse);

    const deleteButton = await screen.findByText('Delete');
    fireEvent.click(deleteButton);
  
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        '/api/v1/category/delete-category/1'
      );
    });
    expect(toast.error).toHaveBeenCalledWith('error while deleting category');
  });

  test('handleDelete displays error toast when an exception occurs during category deletion', async () => {
    setupCreateCategory();
    axios.delete.mockRejectedValueOnce(new Error("Network error"));
  
    const deleteButton = await screen.findByText('Delete');
    fireEvent.click(deleteButton);
  
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        '/api/v1/category/delete-category/1'
      );
    });
    expect(toast.error).toHaveBeenCalledWith("Somtihing went wrong");
  });
});

describe('Test the visibility of the modal', () => {
  test('renders and closes Modal', async () => {
    setupCreateCategory();

    const editButton = await screen.findByText("Edit");
    fireEvent.click(editButton);
    const closeButton = screen.getByLabelText("Close");
    fireEvent.click(closeButton);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });  
});

