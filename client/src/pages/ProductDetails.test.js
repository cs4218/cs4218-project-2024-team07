import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { Header, MemoryRouter, Route, Routes } from "react-router-dom";
import ProductDetails from "../pages/ProductDetails";
import "@testing-library/jest-dom/extend-expect";

// Mock axios
jest.mock("axios");

// Mock the react-router-dom hooks
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    slug: "test-product",
  }),
  useNavigate: () => jest.fn(),
}));

// Setup mock data
const mockProduct = {
  _id: "1",
  name: "Test Product",
  description: "This is a test product",
  price: 100,
  category: {
    _id: "1",
    name: "Test Category",
  },
};

const mockRelatedProducts = [
  {
    _id: "2",
    name: "Related Product 1",
    description: "This is a related product",
    price: 50,
    category: {
      _id: "1",
      name: "Test Category",
    },
    slug: "related-product-1",
  },
];

describe("ProductDetails Component", () => {
  beforeEach(() => {
    // Mock axios responses for product and related products
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/product/get-product/test-product") {
        return Promise.resolve({ data: { product: mockProduct } });
      }
      if (url === `/api/v1/product/related-product/1/1`) {
        return Promise.resolve({ data: { products: mockRelatedProducts } });
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks(); // clear mock history between tests
  });
  test('renders Header component correctly', () => {
    render(<Header someArray={['item1', 'item2']} />); // Passing an array to avoid undefined
        // your test assertions...
        test("renders product details correctly", async () => {
        render(
            <MemoryRouter initialEntries={["/product/test-product"]}>
                <Routes>
                <Route path="/product/:slug" element={<ProductDetails />} />
                </Routes>
            </MemoryRouter>
        );

        // Check if the loading text is shown initially
        expect(screen.getByText("Product Details")).toBeInTheDocument();

        // Wait for the product details to load
        await waitFor(() => {
        expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
        expect(screen.getByText(/This is a test product/i)).toBeInTheDocument();
        expect(screen.getByText("$100.00")).toBeInTheDocument();
        expect(screen.getByText(/Test Category/i)).toBeInTheDocument();
        });
    });
  });


//   test("renders related products correctly", async () => {
//     render(
//       <MemoryRouter initialEntries={["/product/test-product"]}>
//         <Routes>
//           <Route path="/product/:slug" element={<ProductDetails />} />
//         </Routes>
//       </MemoryRouter>
//     );

//     // Wait for related products to load
//     await waitFor(() => {
//       expect(screen.getByText("Similar Products ➡️")).toBeInTheDocument();
//       expect(screen.getByText(/Related Product 1/i)).toBeInTheDocument();
//       expect(screen.getByText("$50.00")).toBeInTheDocument();
//     });
//   });

//   test("displays no similar products message when no related products found", async () => {
//     // Mock no related products response
//     axios.get.mockImplementation((url) => {
//       if (url === "/api/v1/product/get-product/test-product") {
//         return Promise.resolve({ data: { product: mockProduct } });
//       }
//       if (url === `/api/v1/product/related-product/1/1`) {
//         return Promise.resolve({ data: { products: [] } });
//       }
//     });

//     render(
//       <MemoryRouter initialEntries={["/product/test-product"]}>
//         <Routes>
//           <Route path="/product/:slug" element={<ProductDetails />} />
//         </Routes>
//       </MemoryRouter>
//     );

//     // Wait for the "no similar products" message to be shown
//     await waitFor(() => {
//       expect(screen.getByText("No Similar Products found")).toBeInTheDocument();
//     });
//   });
});