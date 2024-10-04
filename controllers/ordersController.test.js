import { jest } from "@jest/globals";
import orderModel from "../models/orderModel.js";
import {
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
} from "./authController.js";

jest.mock("../middlewares/authMiddleware", () => ({
  requireSignIn: jest.fn((req, res, next) => {
    req.user = { id: "testUserId" };
    next();
  }),
  isAdmin: jest.fn((req, res, next) => next()),
}));

describe("GetOrders Controller", () => {
  let req, res;
  let mockedOrders;

  beforeEach(() => {
    const buyerId = "12345";
    req = {
      user: { _id: buyerId },
      body: {
        name: "Test User",
        email: "test-authController-el@example.com",
        password: "Password123",
        phone: "1234567890",
        address: "123 Test Street",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    mockedOrders = [
      {
        _id: "order1",
        products: ["product1", "product2"],
        buyer: buyerId,
      },
      {
        _id: "order2",
        products: ["product3"],
        buyer: buyerId,
      },
    ];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 if orders are gotten successfully", async () => {
    orderModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockedOrders),
      }),
    });

    await getOrdersController(req, res);
    expect(orderModel.find).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(mockedOrders);
  });

  it.failing(
    "should return 500 status and error message on failure",
    async () => {
      const error = new Error("Error details here");
      orderModel.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockRejectedValue(error),
        }),
      });

      await getOrdersController(req, res);

      expect(orderModel.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: expect.stringMatching(/error while getting orders/i),
        error,
      });
      // Wrong spelling
    }
  );
});

describe("GetAllOrders Controller", () => {
  let req, res;
  let mockedAllOrders;

  beforeEach(() => {
    const buyerId = "12345";
    req = {
      user: { _id: buyerId },
      body: {
        name: "Test User",
        email: "test-authController-el@example.com",
        password: "Password123",
        phone: "1234567890",
        address: "123 Test Street",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    mockedAllOrders = [
      {
        _id: "order1",
        products: ["product1", "product2"],
        buyer: buyerId,
        createdAt: now,
      },
      {
        _id: "order2",
        products: ["product3"],
        buyer: buyerId,
        createdAt: oneHourAgo,
      },
    ];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 if all orders are gotten successfully", async () => {
    orderModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockedAllOrders),
        }),
      }),
    });

    await getAllOrdersController(req, res);
    expect(orderModel.find).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(mockedAllOrders);
  });

  it.failing(
    "should return 500 status and error message on failure for getting all orders",
    async () => {
      const error = new Error("Error details here");
      orderModel.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockRejectedValue(mockedAllOrders),
          }),
        }),
      });

      await getAllOrdersController(req, res);

      expect(orderModel.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: expect.stringMatching(/error while getting orders/i),
        error,
      });
      // Wrong spelling for error message
    }
  );
});

describe("OrderStatus Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {
        orderId: "12345",
      },
      body: {
        status: "shipped",
      },
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should update the order status successfully", async () => {
    const updatedOrder = {
      _id: "12345",
      status: "shipped",
    };

    jest.spyOn(orderModel, "findByIdAndUpdate").mockResolvedValue(updatedOrder);

    await orderStatusController(req, res);

    expect(orderModel.findByIdAndUpdate).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(updatedOrder);
  });

  it.failing(
    "should return 500 if an error occurs during the update",
    async () => {
      const error = new Error("Update failed");
      jest.spyOn(orderModel, "findByIdAndUpdate").mockRejectedValue(error);

      await orderStatusController(req, res);

      expect(orderModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: expect.stringMatching(/error while updating order/i),
        error,
      });
      // Incorrect spelling of message
    }
  );
});
