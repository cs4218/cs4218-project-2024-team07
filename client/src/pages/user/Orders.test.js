import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Orders from "./Orders";
import { useAuth } from "../../context/auth";
import axios from "axios";
import moment from "moment";

jest.mock("axios");
jest.mock("./../../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));
jest.mock("../../components/UserMenu");
jest.mock("../../context/auth");
jest.mock("moment", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    fromNow: jest.fn().mockReturnValue("a few seconds ago"),
  })),
}));

describe("Initialization of orders", () => {
  const setAuthMock = jest.fn();
  const mockOrdersData = [
    {
      _id: "order1",
      status: "Delivered",
      buyer: { name: "John Doe" },
      createAt: "2023-09-18T12:34:56.789Z",
      payment: { success: true },
      products: [
        {
          _id: "product1",
          name: "Product 1",
          description: "Description of product 1",
          price: 100,
        },
        {
          _id: "product2",
          name: "Product 2",
          description: "Description of product 2",
          price: 150,
        },
      ],
    },
  ];

  // Default mock authenticated user
  useAuth.mockReturnValue([
    {
      user: {
        name: "Donkey Kong",
        email: "donkey.kong@example.com",
        phone: "1234567890",
        address: "123 Main St",
      },
      token: "mock-token",
    },
    setAuthMock,
  ]);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Initialization of successful orders", async () => {
    axios.get.mockResolvedValue({ data: mockOrdersData });

    const { container } = render(<Orders />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders");
    });

    expect(container).toHaveTextContent("All Orders");
    await waitFor(() => {
      expect(container).toHaveTextContent("Delivered");
    });

    await waitFor(() => {
      expect(container).toHaveTextContent("John Doe");
    });

    await waitFor(() => {
      expect(container).toHaveTextContent("a few seconds ago");
    });

    await waitFor(() => {
      expect(container).toHaveTextContent("Success");
    });

    await waitFor(() => {
      expect(container).toHaveTextContent("Product 1");
    });

    await waitFor(() => {
      expect(container).toHaveTextContent("Product 2");
    });

    await waitFor(() => {
      expect(container).toHaveTextContent("Price : 100");
    });
  });

  it("Initialization of non successful orders", async () => {
    const failedOrderData = [
      {
        _id: "order2",
        status: "Pending",
        buyer: { name: "Jane Doe" },
        createAt: "2023-09-19T10:12:34.789Z",
        payment: { success: false },
        products: [
          {
            _id: "product2",
            name: "Product 2",
            description: "Description of product 2",
            price: 150,
          },
        ],
      },
    ];

    axios.get.mockResolvedValue({ data: failedOrderData });

    const { container } = render(<Orders />);

    await waitFor(() => {
      expect(container).toHaveTextContent("Pending");
    });
    await waitFor(() => {
      expect(container).toHaveTextContent("Failed");
    });
    await waitFor(() => {
      expect(container).toHaveTextContent("Jane Doe");
    });
    await waitFor(() => {
      expect(container).toHaveTextContent("Product 2");
    });
    await waitFor(() => {
      expect(container).toHaveTextContent("Price : 150");
    });
  });
});

describe("API check for orders", () => {
  const setAuthMock = jest.fn();

  // Default mock authenticated user
  useAuth.mockReturnValue([
    {
      user: {
        name: "Donkey Kong",
        email: "donkey.kong@example.com",
        phone: "1234567890",
        address: "123 Main St",
      },
      token: "mock-token",
    },
    setAuthMock,
  ]);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Getting orders API error", async () => {
    const error = new Error("API error");
    const consoleSpy = jest.spyOn(console, "log");
    axios.get.mockRejectedValue(error);

    render(<Orders />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders");
    });

    expect(consoleSpy).toHaveBeenCalledWith(error);
    consoleSpy.mockRestore();
  });
});

describe("Token tests for orders", () => {
  const renderWithAuth = (auth) => {
    useAuth.mockReturnValue([auth, jest.fn()]);
    return render(<Orders />);
  };

  it("Orders not called if no token", () => {
    const initialAuth = { token: null };
    renderWithAuth(initialAuth);

    expect(axios.get).not.toHaveBeenCalled();
  });

  it("Orders called if token changes", async () => {
    const initialAuth = { token: null };
    const newAuth = { token: "valid-token" };

    renderWithAuth(initialAuth);
    expect(axios.get).not.toHaveBeenCalled();

    useAuth.mockReturnValue([newAuth, jest.fn()]);
    render(<Orders />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders");
    });
  });
});

