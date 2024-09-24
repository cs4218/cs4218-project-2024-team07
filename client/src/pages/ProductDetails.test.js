import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import useCategory from "../hooks/useCategory";
import { useSearch } from "../context/search";
import { MemoryRouter } from "react-router-dom";
import ProductDetails from "./ProductDetails";

// Mock axios
jest.mock("axios");
jest.mock("../context/auth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("../context/cart", () => ({
  useCart: jest.fn(),
}));
// Mock useCategory
jest.mock("../hooks/useCategory", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("../context/search", () => ({
  useSearch: jest.fn(),
}));

describe("ProductDetails Component", () => {
  const mockProductData = {
    product: {
      _id: "1",
      name: "Test Product",
      category: { _id: "cat1", name: "Category 1" },
    },
  };

  const mockRelatedProductsData = {
    products: [
      {
        _id: "2",
        name: "Related Product 1",
      },
      {
        _id: "3",
        name: "Related Product 2",
      },
    ],
  };

  beforeEach(() => {
    // Clear mock before each test to avoid interference between tests
    axios.get.mockClear();
    const setAuthMock = jest.fn();
    // Mock useAuth to return a user
    useAuth.mockReturnValue([
      { user: { name: "John Doe", role: 1 }, token: "mock-token" },
      setAuthMock,
    ]);
    useCart.mockReturnValue([[{ id: 1, name: "Item 1" }]]);
    useCategory.mockReturnValue([
      { id: 1, name: "Electronics", slug: "electronics" },
      { id: 2, name: "Books", slug: "books" },
    ]);
    useSearch.mockReturnValue([
      { keyword: "", results: [] },
      jest.fn(),
    ]);
  });

  it("should fetch and display product details", async () => {
    console.log("Starting the test...");
  
    // Mock the axios.get call for getProduct
    axios.get.mockResolvedValueOnce({ data: mockProductData });
    console.log("Mocked axios.get for getProduct:", mockProductData);
  
    // Mock the axios.get call for getSimilarProduct
    axios.get.mockResolvedValueOnce({ data: mockRelatedProductsData });
    console.log("Mocked axios.get for getSimilarProduct:", mockRelatedProductsData);
  
    // Render the component
    render(
      <MemoryRouter>
        <ProductDetails />
      </MemoryRouter>
    );
    console.log("Component rendered.");
  
    // Wait for the product data to be fetched and displayed
    await waitFor(() => {
      console.log("Waiting for axios.get to be called...");
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/get-product/undefined");
      console.log("axios.get call verified.");
    });
   
    await waitFor(() => {
      console.log("Waiting for product to be displayed...");
      expect(screen.getByText("Test Product")).toBeInTheDocument();
      console.log("Product displayed on the screen.");
    });
  
    console.log("Test completed.");
  });
  

  // it("should fetch and display related products", async () => {
  //   // Mock the axios.get call for getProduct
  //   axios.get.mockResolvedValueOnce({ data: mockProductData });

  //   // Mock the axios.get call for getSimilarProduct
  //   axios.get.mockResolvedValueOnce({ data: mockRelatedProductsData });

  //   // Render the component
  //   render(
  //     <Router>
  //       <ProductDetails />
  //     </Router>
  //   );

  //   // Wait for related products to be fetched and displayed
  //   await waitFor(() => {
  //     expect(axios.get).toHaveBeenCalledWith(
  //       `/api/v1/product/related-product/${mockProductData.product._id}/${mockProductData.product.category._id}`
  //     );
  //   });

  //   await waitFor(() => {
  //     expect(screen.getByText("Related Product 1")).toBeInTheDocument();
  //     expect(screen.getByText("Related Product 2")).toBeInTheDocument();
  //   });
  // });

  // it("should log an error if product fetch fails", async () => {
  //   const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

  //   // Mock axios.get to reject
  //   axios.get.mockRejectedValueOnce(new Error("Product fetch failed"));

  //   // Render the component
  //   render(
  //     <Router>
  //       <ProductDetails />
  //     </Router>
  //   );

  //   await waitFor(() => {
  //     expect(consoleSpy).toHaveBeenCalledWith(new Error("Product fetch failed"));
  //   });

  //   consoleSpy.mockRestore();
  // });
});
