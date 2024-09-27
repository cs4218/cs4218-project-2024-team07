import React from "react";
import { render, screen } from "@testing-library/react";
import { useSearch } from "../context/search";
import Layout from "./../components/Layout";
import Search from "./Search";

// Mock the useSearch hook
jest.mock("../context/search");

jest.mock("./../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));
describe("Search Component", () => {
  const mockProducts = [
    {
      _id: "1",
      name: "Test Product 1",
      description: "Description for Test Product 1",
      price: 100,
    },
    {
      _id: "2",
      name: "Test Product 2",
      description: "Description for Test Product 2",
      price: 150,
    },
  ];

  const emptySearchResult = { results: [] };
  const filledSearchResult = { results: mockProducts };

  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  it("should display 'No Products Found' when there are no search results", () => {
    // Mock useSearch to return no products
    useSearch.mockReturnValue([emptySearchResult, jest.fn()]);

    // Render the component
    render(<Search />);

    // Check if "No Products Found" is displayed
    expect(screen.getByText(/No Products Found/i)).toBeInTheDocument();
  });

  it("should display the number of products found", () => {
    // Mock useSearch to return the mock products
    useSearch.mockReturnValue([filledSearchResult, jest.fn()]);

    // Render the component
    render(<Search />);

    // Check if the correct number of products is displayed
    expect(screen.getByText(/Found 2/i)).toBeInTheDocument();
  });

  it("should display product details correctly", () => {
    // Mock useSearch to return the mock products
    useSearch.mockReturnValue([filledSearchResult, jest.fn()]);

    // Render the component
    render(<Search />);

    // Assert that product names, descriptions, and prices are displayed
    mockProducts.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(product.description.substring(0, 30)))).toBeInTheDocument();
      expect(screen.getByText(`$ ${product.price}`)).toBeInTheDocument();
    });
  });
});
