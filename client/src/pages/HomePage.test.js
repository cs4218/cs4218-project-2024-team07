// HomePage.test.js

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HomePage from "./HomePage";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "../context/cart";
import toast from "react-hot-toast";

// Mock the necessary modules and functions
jest.mock("axios");
jest.mock("react-hot-toast", () => ({
    success: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => jest.fn(),
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

const mockProductsPage1 = {
    products: [
        {
            _id: "prod1",
            name: "Product 1",
            price: 100,
            description: "Description 1",
            slug: "product-1",
        },
        {
            _id: "prod2",
            name: "Product 2",
            price: 200,
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
    beforeEach(() => {
        // Clear mocks before each test to prevent data leakage
        axios.get.mockClear();
        axios.post.mockClear();
        toast.success.mockClear();
        localStorage.clear();
    });

    test("renders categories and products", async () => {
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
            // Check that categories are rendered
            expect(screen.getByText("Category 1")).toBeInTheDocument();
        });

        expect(screen.getByText("Category 2")).toBeInTheDocument();

        // Wait for products to be loaded and displayed
        await waitFor(() => {
            expect(screen.getByText("Product 1")).toBeInTheDocument();
        });

        // Check that products are rendered
        expect(screen.getByText("Product 2")).toBeInTheDocument();
    });

    it("filters products by category", async () => {
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

        // Simulate checking a category checkbox to filter products
        const category1Checkbox = screen.getByLabelText("Category 1");
        fireEvent.click(category1Checkbox);

        // Wait for filtered products to be displayed
        await waitFor(() => {
            expect(screen.getByText("Product 3")).toBeInTheDocument();
        });

        // Ensure original products are no longer displayed
        expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
        expect(screen.queryByText("Product 2")).not.toBeInTheDocument();
    });

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
    });

    it("does not render button to load more when there is no product", async () => {
        axios.get.mockImplementation((url) => {
            if (url === "/api/v1/category/get-category") {
                return Promise.resolve({ data: mockCategories });
            } else if (url.startsWith("/api/v1/product/product-list/")) {
                return Promise.resolve({ data: [] });
            } else if (url === "/api/v1/product/product-count") {
                return Promise.resolve({ data: { total: 0 } });
            }
        });

        render(
            <CartProvider>
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            </CartProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("Category 1")).toBeInTheDocument();
        });

        expect(screen.queryByText(/Loadmore/i)).not.toBeInTheDocument();
    });

    it("does not render button to load more when all products shown", async () => {
        axios.get.mockImplementation((url) => {
            if (url === "/api/v1/category/get-category") {
                return Promise.resolve({ data: mockCategories });
            } else if (url.startsWith("/api/v1/product/product-list/")) {
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

        await waitFor(() => {
            expect(screen.getByText("Product 1")).toBeInTheDocument();
        });

        expect(screen.queryByText(/Loadmore/i)).not.toBeInTheDocument();
    });
});
