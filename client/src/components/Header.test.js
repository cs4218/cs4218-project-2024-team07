import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "./Header"; // Adjust the path as necessary
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import { useSearch } from "../context/search";
import useCategory from "../hooks/useCategory";
import toast from "react-hot-toast";

// Mock useAuth
jest.mock("../context/auth", () => ({
  useAuth: jest.fn(),
}));

// Mock useCart
jest.mock("../context/cart", () => ({
  useCart: jest.fn(),
}));

// Mock useCategory
jest.mock("../hooks/useCategory", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock useSearch
jest.mock("../context/search", () => ({
  useSearch: jest.fn(),
}));

// Mock toast
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
}));

beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();

  const localStorageMock = (() => {
    let store = {};

    return {
      getItem: jest.fn((key) => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString();
      }),
      removeItem: jest.fn((key) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();

  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });

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

describe("Header Component", () => {
    describe("When user is not authenticated", () => {
        beforeEach(() => {
            // Mock useAuth to return null user
            useAuth.mockReturnValue([{ user: null }, jest.fn()]);
        });

        it("should display login and register links", () => {
            render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
            );

            expect(screen.getByText(/login/i)).toBeInTheDocument();
            expect(screen.getByText(/register/i)).toBeInTheDocument();
        });

        it("should not display user dropdown", () => {
            render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
            );

            expect(screen.queryByText(/john doe/i)).not.toBeInTheDocument();
        });
    });

describe("When user is authenticated", () => {
    const setAuthMock = jest.fn();

    beforeEach(() => {
        // Mock useAuth to return a user
        useAuth.mockReturnValue([
        { user: { name: "John Doe", role: 1 }, token: "mock-token" },
        setAuthMock,
        ]);
    });

    it("should display user name and dashboard link", () => {
        render(
        <MemoryRouter>
            <Header />
        </MemoryRouter>
        );

        expect(screen.getByText(/john doe/i)).toBeInTheDocument();
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });

    it("should call logout function when logout is clicked", () => {
        render(
        <MemoryRouter>
            <Header />
        </MemoryRouter>
        );

        // Click on user dropdown to display the menu
        fireEvent.click(screen.getByText(/john doe/i));

        // Click on logout
        fireEvent.click(screen.getByText(/logout/i));

        // Check that setAuth was called
        expect(setAuthMock).toHaveBeenCalledWith({
            user: null,
            token: "",
        });

        expect(localStorage.removeItem).toHaveBeenCalledWith("auth");
        expect(toast.success).toHaveBeenCalledWith("Logout Successfully");
    });
});

//BUG: the categories does not have any key for each item
describe("Categories Dropdown", () => {
    it("should display categories in dropdown", () => {
        render(
        <MemoryRouter>
            <Header />
        </MemoryRouter>
        );

        // Click on Categories to open dropdown
        const categoriesLinks = screen.getAllByText(/categories/i);
        fireEvent.click(categoriesLinks[0]);

        // Check that categories are displayed
        expect(screen.getByText(/electronics/i)).toBeInTheDocument();
        expect(screen.getByText(/books/i)).toBeInTheDocument();
    });
});

describe("Cart Badge", () => {
    it("should display the correct number of items in the cart", () => {
        render(
        <MemoryRouter>
            <Header />
        </MemoryRouter>
        );

        // Check that the cart badge displays the correct number
        expect(screen.getByText(/cart/i)).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument(); // Badge shows "1"
    });
});

describe("SearchInput Component within Header", () => {
    it("should render the search input field", () => {
        render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        );

        // Check that the search input field is rendered
        const searchInput = screen.getByPlaceholderText(/search/i);
            expect(searchInput).toBeInTheDocument();
        });
    });
});
