import React from "react";
import { render, waitFor } from "@testing-library/react";
import Orders from "./Orders";
import { useAuth } from "../../context/auth";
import axios from "axios";

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

const testInitializationOfOrders = (
  Component,
  apiUrl,
  mockOrdersData,
  componentName = Component.name
) => {
  it(`Initialization of successful ${componentName}`, async () => {
    axios.get.mockResolvedValue({ data: mockOrdersData });

    const { container } = render(<Component />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(apiUrl);
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

  it(`Initialization of non-successful ${componentName}`, async () => {
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

    const { container } = render(<Component />);

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
};

const testApiErrorHandling = (
  Component,
  apiUrl,
  componentName = Component.name
) => {
  it(`Getting ${componentName} API error`, async () => {
    const error = new Error("Error details");
    const consoleSpy = jest.spyOn(console, "log");
    axios.get.mockRejectedValue(error);

    render(<Component />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(apiUrl);
    });

    expect(consoleSpy).toHaveBeenCalledWith(error);
    consoleSpy.mockRestore();
  });
};

const testTokenBehavior = (
  Component,
  apiUrl,
  componentName = Component.name
) => {
  const renderWithAuth = (auth) => {
    useAuth.mockReturnValue([auth, jest.fn()]);
    return render(<Component />);
  };

  it(`${componentName} not called if no token`, () => {
    const initialAuth = { token: null };
    renderWithAuth(initialAuth);

    expect(axios.get).not.toHaveBeenCalled();
  });

  it(`${componentName} called if token changes`, async () => {
    const initialAuth = { token: null };
    const newAuth = { token: "valid-token" };

    renderWithAuth(initialAuth);
    expect(axios.get).not.toHaveBeenCalled();

    useAuth.mockReturnValue([newAuth, jest.fn()]);
    render(<Component />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(apiUrl);
    });
  });
};

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

  testInitializationOfOrders(
    Orders,
    "/api/v1/auth/orders",
    mockOrdersData,
    "Orders"
  );
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

  testApiErrorHandling(Orders, "/api/v1/auth/orders", "Orders");
});

describe("Token tests for orders", () => {
  testTokenBehavior(Orders, "/api/v1/auth/orders", "Orders");
});
