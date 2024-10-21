import { jest } from "@jest/globals";
import userModel from "../models/userModel.js";
import { updateProfileController } from "./authController.js";
import { describe } from "node:test";

jest.mock("../middlewares/authMiddleware", () => ({
  requireSignIn: jest.fn((req, res, next) => {
    req.user = { id: "testUserId" };
    next();
  }),
  isAdmin: jest.fn((req, res, next) => next()),
}));

describe("Profile controller", () => {
  let req, res;
  let findByIdMock, findByIdAndUpdateMock;

  beforeEach(() => {
    req = {
      user: { _id: "12345" },
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

    findByIdMock = jest.spyOn(userModel, "findById").mockResolvedValue({
      _id: "12345",
      name: "Old Test User",
      email: "oldUserEmail",
      password: "oldUserPassword",
      phone: "2345678901",
      address: "oldUserAddress",
    });

    findByIdAndUpdateMock = jest
      .spyOn(userModel, "findByIdAndUpdate")
      .mockResolvedValue({
        _id: "12345",
        name: "Test User",
        email: "test-authController-el@example.com",
        password: "Password123",
        phone: "1234567890",
        address: "123 Test Street",
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 if profile updated successfully", async () => {
    await updateProfileController(req, res);
    expect(findByIdMock).toHaveBeenCalled();
    expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
      "12345",
      expect.objectContaining({
        address: "123 Test Street",
        name: "Test User",
        phone: "1234567890",
      }),
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: expect.stringMatching(/profile updated successfully/i),
      updatedUser: {
        _id: "12345",
        name: "Test User",
        email: "test-authController-el@example.com",
        password: "Password123",
        phone: "1234567890",
        address: "123 Test Street",
      },
    });
  });

  it.failing(
    "should return 400 with invalid name: Pairwise test 1",
    async () => {
      req = {
        user: { _id: "12345" },
        body: {
          name: "",
          email: "valid@example.com",
          password: "123456",
          phone: "1234567890",
          address: "Just rightttttttttttttttttttttttttttttttttttttttttttttttttttttttttt address",
        },
      };
      findByIdAndUpdateMock = jest
        .spyOn(userModel, "findByIdAndUpdate")
        .mockRejectedValue({
          _id: "12345",
          name: "",
          email: "valid@example.com",
          password: "123456",
          phone: "1234567890",
          address: "Just rightttttttttttttttttttttttttttttttttttttttttttttttttttttttttt address",
        });
      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringMatching(
          /Name is required, not empty and only has alphabets and hyphens/i
        ),
      });
      // Assumption is that there should be more checks on
      // each of the fields before updating in the userModel
    }
  );

  it.failing(
    "should return 400 with invalid name: Pairwise test 2",
    async () => {
      req = {
        user: { _id: "12345" },
        body: {
          name: "139847",
          email: "$&#*@example.com",
          password: "1234567somepassword",
          phone: "",
          address:
            "123 Main St",
        },
      };
      findByIdAndUpdateMock = jest
        .spyOn(userModel, "findByIdAndUpdate")
        .mockRejectedValue({
          _id: "12345",
          name: "139847",
          email: "$&#*@example.com",
          password: "1234567somepassword",
          phone: "",
          address:
            "123 Main St",
        });
      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringMatching(
          /Name is required, not empty and only has alphabets and hyphens/i
        ),
      });
      // Assumption is that there should be more checks on
      // each of the fields before updating in the userModel
    }
  );

  it.failing(
    "should return 400 with invalid name: Pairwise test 3",
    async () => {
      req = {
        user: { _id: "12345" },
        body: {
          name: "@#$%",
          email: "",
          password: "123",
          phone: "elifhaoeid",
          address: "Just rightttttttttttttttttttttttttttttttttttttttttttttttttttttttttt address",
        },
      };
      findByIdAndUpdateMock = jest
        .spyOn(userModel, "findByIdAndUpdate")
        .mockRejectedValue({
          _id: "12345",
          name: "@#$%",
          email: "",
          password: "123",
          phone: "elifhaoeid",
          address: "Just rightttttttttttttttttttttttttttttttttttttttttttttttttttttttttt address",
        });
      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringMatching(
          /Name is required, not empty and only has alphabets and hyphens/i
        ),
      });
      // Assumption is that there should be more checks on
      // each of the fields before updating in the userModel
    }
  );

  it.failing(
    "should return 400 with invalid email: Pairwise test 4",
    async () => {
      req = {
        user: { _id: "12345" },
        body: {
          name: "John Doe",
          email: "13489",
          password: "1234567somepassword",
          phone: "@#$%",
          address: "Loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong address",
        },
      };
      findByIdAndUpdateMock = jest
        .spyOn(userModel, "findByIdAndUpdate")
        .mockRejectedValue({
          _id: "12345",
          name: "John Doe",
          email: "13489",
          password: "1234567somepassword",
          phone: "@#$%",
          address: "Loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong address",
        });
      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringMatching(
          /Email is required, not empty and in proper format/i
        ),
      });
      // Assumption is that there should be more checks on
      // each of the fields before updating in the userModel
    }
  );

  it.failing(
    "should return 400 with invalid phone: Pairwise test 5",
    async () => {
      req = {
        user: { _id: "12345" },
        body: {
          name: "John Doe",
          email: "valid@example.com",
          password: "123456",
          phone: "elifhaoeid",
          address: "123 Main St",
        },
      };
      findByIdAndUpdateMock = jest
        .spyOn(userModel, "findByIdAndUpdate")
        .mockRejectedValue({
          _id: "12345",
          name: "John Doe",
          email: "valid@example.com",
          password: "123456",
          phone: "elifhaoeid",
          address: "123 Main St",
        });
      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringMatching(
          /Phone is required, not empty and in proper format/i
        ),
      });
      // Assumption is that there should be more checks on
      // each of the fields before updating in the userModel
    }
  );

  it.failing(
    "should return 400 with proper error message if name is invalid",
    async () => {
      req = {
        user: { _id: "12345" },
        body: {
          name: "@#$%",
          email: "valid@example.com",
          password: "1234567valid",
          phone: "1234567890",
          address: "123 Main St",
        },
      };
      findByIdAndUpdateMock = jest
        .spyOn(userModel, "findByIdAndUpdate")
        .mockRejectedValue({
          _id: "12345",
          name: "@#$%",
          email: "valid@example.com",
          password: "1234567valid",
          phone: "1234567890",
          address: "123 Main St",
        });
      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringMatching(
          /Name is required, not empty and only has alphabets and hyphens/i
        ),
      });
      // Assumption is that there should be more checks on
      // each of the fields before updating in the userModel
      // Expected error message is simply a demonstration of what the intended
      // error message should be
    }
  );

  it.failing(
    "should return 400 with proper error message if email is invalid",
    async () => {
      req = {
        user: { _id: "12345" },
        body: {
          name: "John Doe",
          email: "$@&#*@example.com",
          password: "1234567valid",
          phone: "1234567890",
          address: "123 Main St",
        },
      };
      findByIdAndUpdateMock = jest
        .spyOn(userModel, "findByIdAndUpdate")
        .mockRejectedValue({
          _id: "12345",
          name: "John Doe",
          email: "$@&#*@example.com",
          password: "1234567valid",
          phone: "1234567890",
          address: "123 Main St",
        });
      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringMatching(
          /Email is required, not empty and in proper format/i
        ),
      });
      // Assumption is that there should be more checks on
      // each of the fields before updating in the userModel
      // Expected error message is simply a demonstration of what the intended
      // error message should be
    }
  );

  it.failing(
    "should return 400 with proper error message if password is less than 6 characters",
    async () => {
      req.body = {
        password: "123",
      };

      await updateProfileController(req, res);
      expect(findByIdMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringMatching(
          /Password is required and 6 character long/i
        ),
      });
      // Wrong spelling in result
    }
  );

  it.failing(
    "should return 400 with proper error message if address is invalid",
    async () => {
      req = {
        user: { _id: "12345" },
        body: {
          name: "John Doe",
          email: "valid@example.com",
          password: "1234567valid",
          phone: "1234567890",
          address:
            "Loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong address",
        },
      };
      findByIdAndUpdateMock = jest
        .spyOn(userModel, "findByIdAndUpdate")
        .mockRejectedValue({
          _id: "12345",
          name: "John Doe",
          email: "valid@example.com",
          password: "1234567valid",
          phone: "1234567890",
          address:
            "Loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong address",
        });
      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringMatching(
          /Address is required, not empty and not more than 75 characters long/i
        ),
      });
      // Assumption is that there should be more checks on
      // each of the fields before updating in the userModel
      // Expected error message is simply a demonstration of what the intended
      // error message should be
    }
  );

  it.failing(
    "should return 400 with proper error message if phone is invalid",
    async () => {
      req = {
        user: { _id: "12345" },
        body: {
          name: "John Doe",
          email: "valid@example.com",
          password: "1234567valid",
          phone: "elifhaoeid",
          address: "123 Main St",
        },
      };
      findByIdAndUpdateMock = jest
        .spyOn(userModel, "findByIdAndUpdate")
        .mockRejectedValue({
          _id: "12345",
          name: "John Doe",
          email: "valid@example.com",
          password: "1234567valid",
          phone: "elifhaoeid",
          address: "123 Main St",
        });
      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringMatching(
          /Phone is required, not empty and in proper format/i
        ),
      });
      // Assumption is that there should be more checks on
      // each of the fields before updating in the userModel
      // Expected error message is simply a demonstration of what the intended
      // error message should be
    }
  );

  it.failing(
    "should return 500 error if userModel cannot be accessed",
    async () => {
      const error = new Error("Error details here");
      findByIdAndUpdateMock = jest
        .spyOn(userModel, "findByIdAndUpdate")
        .mockRejectedValueOnce(error);

      await updateProfileController(req, res);
      expect(findByIdMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: expect.stringMatching(/error while update profile/i),
        error: error,
      });
      // The 500 HTTP error should be thrown since we do not know
      // the reason for the error.
    }
  );
});
