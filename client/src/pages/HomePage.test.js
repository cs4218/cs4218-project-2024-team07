import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import HomePage from "./HomePage";
import axios from "axios";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { CartProvider } from "../context/cart";
import toast from "react-hot-toast";

// Mock the necessary modules and functions
jest.mock("axios");
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
}));

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../components/Layout", () => ({ children, title }) => (
  <div>
    <h1>{title}</h1>
    {children}
  </div>
));

// Mock data for categories and products
const mockCategories = {
  success: true,
  category: [
    { _id: "cat1", name: "Category 1" },
    { _id: "cat2", name: "Category 2" },
  ],
};

const mockCategoriesSingle = {
  success: true,
  category: [{ _id: "cat1", name: "Category 1" }],
};

const mockCategoriesEmpty = {
  success: true,
  category: [],
};

const mockProductsPage1 = {
  products: [
    {
      _id: "prod1",
      name: "Product 1",
      price: 10,
      description: "Description 1",
      slug: "product-1",
    },
    {
      _id: "prod2",
      name: "Product 2",
      price: 20,
      description: "Description 2",
      slug: "product-2",
    },
  ],
};

const mockProductsPage2 = {
  products: [
    {
      _id: "prod3",
      name: "Product 3",
      price: 300,
      description: "Description 3",
      slug: "product-3",
    },
    {
      _id: "prod4",
      name: "Product 4",
      price: 400,
      description: "Description 4",
      slug: "product-4",
    },
  ],
};

const mockProductCount = { total: 4 };

const mockFilteredProducts = {
  products: [
    {
      _id: "prod3",
      name: "Product 3",
      price: 150,
      description: "Description 3",
      slug: "product-3",
    },
  ],
};

describe("HomePage Component", () => {
  let consoleLogSpy;
  beforeEach(() => {
    // Clear mocks before each test to prevent data leakage
    axios.get.mockClear();
    axios.post.mockClear();
    toast.success.mockClear();
    localStorage.clear();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  })

  // Test Case 1: Successful Initial Data Fetching and Display
  it("renders categories and products", async () => {
    // Mock API responses for categories and products
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({ data: mockCategories });
      } else if (url.startsWith("/api/v1/product/product-list/")) {
        return Promise.resolve({ data: mockProductsPage1 });
      } else if (url === "/api/v1/product/product-count") {
        return Promise.resolve({ data: mockProductCount });
      }
    });

    render(
      <CartProvider>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </CartProvider>
    );

    // Wait for categories to be loaded and displayed
    await waitFor(() => {
      expect(screen.getByText("Category 1")).toBeInTheDocument();
    });

    expect(screen.getByText("Category 2")).toBeInTheDocument();

    // Wait for products to be loaded and displayed
    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });

    expect(screen.getByText("Product 2")).toBeInTheDocument();
  });

  // Test Case 2: Error Handling in Fetching Categories
  it("handles categories fetch failure gracefully", async () => {
    // Mock the categories API to return an error
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.reject(new Error("Network Error"));
      } else if (url.startsWith("/api/v1/product/product-list/")) {
        return Promise.resolve({ data: mockProductsPage1 });
      } else if (url === "/api/v1/product/product-count") {
        return Promise.resolve({ data: mockProductCount });
      }
    });
    
    render(
      <CartProvider>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </CartProvider>
    );

    // Wait for the component to handle the error
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    // Since the component continues, we can check for products
    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });

    // Since the total product count is still fetched, 
    // the load more button should show up
    await waitFor(() => {
      expect(screen.getByText("Loadmore")).toBeInTheDocument();
    })
  });

  // Test Case 3: Error Handling in Fetching Total Products
  it("handles total product count fetch failure gracefully", async () => {
    // Mock API responses
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({ data: mockCategories });
      } else if (url === "/api/v1/product/product-count") {
        return Promise.reject(new Error("Network Error"));
      } else if (url.startsWith("/api/v1/product/product-list/")) {
        return Promise.resolve({ data: mockProductsPage1 });
      }
    });

    render(
      <CartProvider>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </CartProvider>
    );

    // Check that categories are still rendered
    await waitFor(() => {
      expect(screen.getByText("Category 1")).toBeInTheDocument();
    });

    // Since the component continues, we can check for products
    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });

    // Since total product count isn't loaded, the load more button shouldn't be there
    await waitFor(() => {
      expect(screen.queryByText("Loadmore")).not.toBeInTheDocument();
    })

    // Wait for the component to handle the error
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // Test Case 4: Error Handling in Fetching Initial Products
  it("handles initial products fetch failure gracefully", async () => {
    // Mock API responses
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({ data: mockCategories });
      } else if (url === "/api/v1/product/product-count") {
        return Promise.resolve({ data: mockProductCount });
      } else if (url.startsWith("/api/v1/product/product-list/")) {
        return Promise.reject(new Error("Network Error"));
      }
    });

    render(
      <CartProvider>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </CartProvider>
    );

    // Wait for categories to be loaded
    await waitFor(() => {
      expect(screen.getByText("Category 1")).toBeInTheDocument();
    });

    // Wait for the component to handle the error
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    // Products should not be displayed
    expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
  });

  // Test Case 5: Successful Product Filtering by Category and Price
  it("filters products by category and price", async () => {
    // Mock API responses for initial load
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({ data: mockCategories });
      } else if (url.startsWith("/api/v1/product/product-list/")) {
        return Promise.resolve({ data: mockProductsPage1 });
      } else if (url === "/api/v1/product/product-count") {
        return Promise.resolve({ data: mockProductCount });
      }
    });

    // Mock API response for filtered products
    axios.post.mockImplementation((url) => {
      if (url === "/api/v1/product/product-filters") {
        return Promise.resolve({ data: mockFilteredProducts });
      }
    });

    render(
      <CartProvider>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </CartProvider>
    );

    // Wait for initial products to be loaded
    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });

    // Simulate checking a category checkbox
    const category1Checkbox = screen.getByLabelText("Category 1");
    fireEvent.click(category1Checkbox);

    // Simulate selecting a price range
    const priceRadio = screen.getByLabelText("$100 or more");
    fireEvent.click(priceRadio);

    // Wait for filtered products to be displayed
    await waitFor(() => {
      expect(screen.getByText("Product 3")).toBeInTheDocument();
    });

    // Ensure original products are no longer displayed
    expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Product 2")).not.toBeInTheDocument();
  });

  // Test Case 6: Error Handling in Product Filtering
  it("handles product filtering failure gracefully", async () => {
    // Mock API responses for initial load
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({ data: mockCategories });
      } else if (url.startsWith("/api/v1/product/product-list/")) {
        return Promise.resolve({ data: mockProductsPage1 });
      } else if (url === "/api/v1/product/product-count") {
        return Promise.resolve({ data: mockProductCount });
      }
    });

    // Mock API response for filterProduct to throw error
    axios.post.mockImplementation((url) => {
      if (url === "/api/v1/product/product-filters") {
        return Promise.reject(new Error("Network Error"));
      }
    });

    render(
      <CartProvider>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </CartProvider>
    );

    // Wait for initial products to be loaded
    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });

    // Simulate checking a category checkbox
    const category1Checkbox = screen.getByLabelText("Category 1");
    fireEvent.click(category1Checkbox);

    // Wait for the component to handle the error
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    // Products should remain unchanged
    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Product 2")).toBeInTheDocument();
  });

  // Test Case 7: Successful Loading of More Products
  it('loads more products when "Loadmore" is clicked', async () => {
    // Mock API responses for initial and subsequent product loads
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({ data: mockCategories });
      } else if (url.endsWith("/product-list/1")) {
        return Promise.resolve({ data: mockProductsPage1 });
      } else if (url.endsWith("/product-list/2")) {
        return Promise.resolve({ data: mockProductsPage2 });
      } else if (url === "/api/v1/product/product-count") {
        return Promise.resolve({ data: { total: 4 } });
      }
    });

    render(
      <CartProvider>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </CartProvider>
    );

    // Wait for initial products to be loaded
    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });

    // Click the "Loadmore" button to load additional products
    const loadMoreButton = screen.getByText(/Loadmore/i);
    fireEvent.click(loadMoreButton);

    // Wait for new products to be loaded and displayed
    await waitFor(() => {
      expect(screen.getByText("Product 3")).toBeInTheDocument();
    });

    // Verify that the new products are displayed
    expect(screen.getByText("Product 4")).toBeInTheDocument();

    // Verify that old products are still displayed
    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Product 2")).toBeInTheDocument();
  });

  // Test Case 8: Error Handling in Loading More Products
  it("handles load more products failure gracefully", async () => {
    // Mock API responses for initial load
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({ data: mockCategories });
      } else if (url.endsWith("/product-list/1")) {
        return Promise.resolve({ data: mockProductsPage1 });
      } else if (url.endsWith("/product-list/2")) {
        // 2nd page returns an error
        return Promise.reject(new Error("Network Error"));
      } else if (url === "/api/v1/product/product-count") {
        return Promise.resolve({ data: { total: 4 } });
      }
    });

    render(
      <CartProvider>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </CartProvider>
    );

    // Wait for initial products to be loaded
    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });

    // Click the "Loadmore" button
    const loadMoreButton = screen.getByText(/Loadmore/i);
    fireEvent.click(loadMoreButton);

    // Wait for error handling
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    // Products should remain unchanged
    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.queryByText("Product 3")).not.toBeInTheDocument();
  });

  // Test Case 9: Adding a Product to the Cart Successfully
  it("adds product to cart", async () => {
    // Mock API responses for initial load
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({ data: mockCategories });
      } else if (url.startsWith("/api/v1/product/product-list/")) {
        return Promise.resolve({ data: mockProductsPage1 });
      } else if (url === "/api/v1/product/product-count") {
        return Promise.resolve({ data: mockProductCount });
      }
    });

    render(
      <CartProvider>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </CartProvider>
    );

    // Wait for products to be loaded
    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });

    // Click the "ADD TO CART" button for the first product
    const addToCartButtons = screen.getAllByText("ADD TO CART");
    fireEvent.click(addToCartButtons[0]);

    // Check that a success toast message is displayed
    expect(toast.success).toHaveBeenCalledWith("Item Added to cart");

    // Verify that the product is added to localStorage
    const cartItems = JSON.parse(localStorage.getItem("cart"));
    expect(cartItems.length).toBe(1);
    expect(cartItems[0]._id).toBe("prod1");
  });

  // Test Case 10: Error Handling in Adding Product to Cart
  it.failing("handles add to cart failure gracefully", async () => {
    // Mock API responses for initial load
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({ data: mockCategories });
      } else if (url.startsWith("/api/v1/product/product-list/")) {
        return Promise.resolve({ data: mockProductsPage1 });
      } else if (url === "/api/v1/product/product-count") {
        return Promise.resolve({ data: mockProductCount });
      }
    });

    // Mock localStorage.setItem to throw error
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = jest.fn(() => {
      throw new Error("Storage Error");
    });

    render(
      <CartProvider>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </CartProvider>
    );

    // Wait for products to be loaded
    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });

    // Click the "ADD TO CART" button for the first product
    const addToCartButtons = screen.getAllByText("ADD TO CART");
    fireEvent.click(addToCartButtons[0]);

    // Check that error was logged
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));

    // Restore original setItem
    localStorage.setItem = originalSetItem;
  });

  // Test Case 11: Navigating to Product Details Page
  it("navigates to product details page when 'More Details' is clicked", async () => {
    

    // Mock API responses for initial load
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({ data: mockCategories });
      } else if (url.startsWith("/api/v1/product/product-list/")) {
        return Promise.resolve({ data: mockProductsPage1 });
      } else if (url === "/api/v1/product/product-count") {
        return Promise.resolve({ data: mockProductCount });
      }
    });

    render(
      <CartProvider>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </CartProvider>
    );

    // Wait for products to be loaded
    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });

    // Click the "More Details" button for the first product
    const moreDetailsButtons = screen.getAllByText("More Details");
    fireEvent.click(moreDetailsButtons[0]);

    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith("/product/product-1");
  });

  // Test Case 12: Resetting Filters
  it("resets filters when 'RESET FILTERS' is clicked", async () => {
    // Mock API responses
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({ data: mockCategories });
      } else if (url.startsWith("/api/v1/product/product-list/")) {
        return Promise.resolve({ data: mockProductsPage1 });
      } else if (url === "/api/v1/product/product-count") {
        return Promise.resolve({ data: mockProductCount });
      }
    });

    // Mock filtered products
    axios.post.mockImplementation((url) => {
      if (url === "/api/v1/product/product-filters") {
        return Promise.resolve({ data: mockFilteredProducts });
      }
    });

    const original = window.location;
    const reloadFn = () => window.location.reload();

    // Mock window.location.reload
    Object.defineProperty(window, "location", {
      value: {
        reload: jest.fn(),
      },
      configurable: true
    });

    render(
      <CartProvider>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </CartProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });

    // Apply filters
    const category1Checkbox = screen.getByLabelText("Category 1");
    fireEvent.click(category1Checkbox);

    // Wait for filtered products
    await waitFor(() => {
      expect(screen.getByText("Product 3")).toBeInTheDocument();
    });

    // Click "RESET FILTERS"
    const resetButton = screen.getByText("RESET FILTERS");
    fireEvent.click(resetButton);

    // Verify that window.location.reload was called
    expect(window.location.reload).toHaveBeenCalled();

    Object.defineProperty(window, 'location', { configurable: true, value: original });
  });

  // Test Case 13: 1 page of products
  it('does not render Loadmore when there is only 1 page', async () => {
    // Mock API responses for initial and subsequent product loads
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({ data: mockCategories });
      } else if (url.endsWith("/product-list/1")) {
        return Promise.resolve({ data: mockProductsPage1 });
      } else if (url === "/api/v1/product/product-count") {
        return Promise.resolve({ data: { total: 2 } });
      }
    });

    render(
      <CartProvider>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </CartProvider>
    );

    // Wait for initial products to be loaded
    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });

    expect(screen.queryByText("Loadmore")).not.toBeInTheDocument();
  });

  // Test Case 14: Repeated clicking of Loadmore
  it("does not render Loadmore when all products are loaded", async () => {
    // Mock API responses for initial and subsequent product loads
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({ data: mockCategories });
      } else if (url.endsWith("/product-list/1")) {
        return Promise.resolve({ data: mockProductsPage1 });
      } else if (url.endsWith("/product-list/2")) {
        return Promise.resolve({ data: mockProductsPage2 });
      } else if (url === "/api/v1/product/product-count") {
        return Promise.resolve({ data: { total: 4 } });
      }
    });

    render(
      <CartProvider>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </CartProvider>
    );

    // Wait for initial products to be loaded
    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });

    // Click the "Loadmore"" button one time
    const moreDetailsButtons = screen.getAllByText(/Loadmore/i);
    fireEvent.click(moreDetailsButtons[0]);

    // Wait for all products to be loaded
    await waitFor(() => {
      expect(screen.getByText("Product 3")).toBeInTheDocument();
    });

    expect(screen.queryByText("Loadmore")).not.toBeInTheDocument();
  })

  // Test Case 15: Loadmore and filters
  it.failing("does not render Loadmore when all products are loaded then filtered", async () => {
    // Mock API responses for initial and subsequent product loads
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({ data: mockCategories });
      } else if (url.endsWith("/product-list/1")) {
        return Promise.resolve({ data: mockProductsPage1 });
      } else if (url.endsWith("/product-list/2")) {
        return Promise.resolve({ data: mockProductsPage2 });
      } else if (url === "/api/v1/product/product-count") {
        return Promise.resolve({ data: { total: 4 } });
      }
    });

    // Mock API response for filtered products
    axios.post.mockImplementation((url) => {
      if (url === "/api/v1/product/product-filters") {
        return Promise.resolve({ data: mockFilteredProducts });
      }
    });

    render(
      <CartProvider>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </CartProvider>
    );

    // Wait for initial products to be loaded
    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });

    // Click the "Loadmore"" button one time
    const moreDetailsButtons = screen.getAllByText(/Loadmore/i);
    fireEvent.click(moreDetailsButtons[0]);

    // Wait for all products to be loaded
    await waitFor(() => {
      expect(screen.getByText("Product 3")).toBeInTheDocument();
    });

    // Simulate selecting a price range
    const priceRadio = screen.getByLabelText("$100 or more");
    fireEvent.click(priceRadio);

    // Wait for filtered products to appear
    await waitFor(() => {
      expect(screen.queryByText("Product 1")).toBeNull();
    });

    expect(screen.queryByText("Loadmore")).not.toBeInTheDocument();
  })
});
