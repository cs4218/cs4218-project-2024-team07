import React from "react";
import axios from "axios";
import { useAuth } from "../../context/auth";
import AdminOrders from "./AdminOrders";
import {
  render,
  waitFor,
  fireEvent,
  screen,
  within,
} from "@testing-library/react";

jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("../../components/AdminMenu");
jest.mock("./../../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));
jest.mock("../../context/auth");
jest.mock("moment", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    fromNow: jest.fn().mockReturnValue("a few seconds ago"),
  })),
}));

const testInitializationOfOrders = (Component, apiUrl, mockOrdersData) => {
  it(`Initialization of successful ${Component.name}`, async () => {
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

  it(`Initialization of non-successful ${Component.name}`, async () => {
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

const testApiErrorHandling = (Component, apiUrl) => {
  it(`Getting ${Component.name} API error`, async () => {
    const error = new Error("API error");
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

const testTokenBehavior = (Component, apiUrl) => {
  const renderWithAuth = (auth) => {
    useAuth.mockReturnValue([auth, jest.fn()]);
    return render(<Component />);
  };

  it(`${Component.name} not called if no token`, () => {
    const initialAuth = { token: null };
    renderWithAuth(initialAuth);

    expect(axios.get).not.toHaveBeenCalled();
  });

  it(`${Component.name} called if token changes`, async () => {
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

describe("Initialization of AdminOrders", () => {
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
    AdminOrders,
    "/api/v1/auth/all-orders",
    mockOrdersData
  );
});

describe("API check for AdminOrders", () => {
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

  testApiErrorHandling(AdminOrders, "/api/v1/auth/all-orders");
});

describe("Token tests for AdminOrders", () => {
  testTokenBehavior(AdminOrders, "/api/v1/auth/all-orders");
});

describe("Change order status for AdminOrders", () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: [
        {
          _id: "1",
          status: "Not Process",
          buyer: { name: "John Doe" },
          createAt: new Date(),
          payment: { success: true },
          products: [
            {
              _id: "product1",
              name: "Product 1",
              description: "Description",
              price: 100,
            },
          ],
        },
      ],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Successfully change status for AdminOrders", async () => {
    const consoleSpy = jest.spyOn(console, "log");
    axios.put.mockResolvedValue({ data: {} });
    const mockStatusOption = "Shipped";

    render(<AdminOrders />);

    const selectButton = await screen.findByRole("combobox");
    fireEvent.mouseDown(selectButton);

    const newStatusOption = screen.getByText(mockStatusOption);
    fireEvent.click(newStatusOption);

    expect(axios.put).toHaveBeenCalledWith(`/api/v1/auth/order-status/1`, {
      status: mockStatusOption,
    });
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("Unsuccessfully change status for AdminOrders", async () => {
    const error = new Error("API error");
    const mockStatusOption = "Shipped";
    const consoleSpy = jest.spyOn(console, "log");

    axios.put.mockRejectedValueOnce(error);

    render(<AdminOrders />);

    const selectButton = await screen.findByRole("combobox");
    fireEvent.mouseDown(selectButton);

    const newStatusOption = screen.getByText(mockStatusOption);
    fireEvent.click(newStatusOption);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(`/api/v1/auth/order-status/1`, {
        status: mockStatusOption,
      });
    });

    expect(consoleSpy).toHaveBeenCalledWith(error);
    consoleSpy.mockRestore();
  });
});

describe("Given order status for AdminOrders", () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: [
        {
          _id: "1",
          status: "Not Process",
          buyer: { name: "John Doe" },
          createAt: new Date(),
          payment: { success: true },
          products: [
            {
              _id: "product1",
              name: "Product 1",
              description: "Description",
              price: 100,
            },
          ],
        },
      ],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Check available statuses for AdminOrders in correct format", async () => {
    axios.put.mockResolvedValue({ data: {} });

    render(<AdminOrders />);
    const selectButton = await screen.findByRole("combobox");
    fireEvent.mouseDown(selectButton);
    const dropdown = within(screen.getByRole("listbox"));
    const optionElements = dropdown.getAllByRole("option");

    const options = [
      "Not Process",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];
    const renderedOptions = optionElements.map((option) => option.textContent);
    expect(renderedOptions).toEqual(options);
  });
});
