import { render, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./auth";
import React from "react";

// Mock localStorage and axios
const mockGetItem = jest.spyOn(Storage.prototype, "getItem");
jest.mock("axios");

const TestComponent = () => {
  const [auth] = useAuth();
  return (
    <div>
      <span>{auth.user ? auth.user.name : "No User"}</span>
      <span>{auth.token ? auth.token : "No Token"}</span>
    </div>
  );
};

describe("AuthProvider", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render with default auth values", async () => {
    mockGetItem.mockReturnValueOnce(null); // No localStorage data

    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByText("No User")).toBeInTheDocument();
    expect(getByText("No Token")).toBeInTheDocument();
  });

  it("should load auth from localStorage and update the state", async () => {
    const mockAuthData = {
      user: { name: "John Doe" },
      token: "some_token",
    };

    mockGetItem.mockReturnValueOnce(JSON.stringify(mockAuthData));

    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Check if the user and token were updated from localStorage
    await waitFor(() => {
      expect(getByText("John Doe")).toBeInTheDocument();
      expect(getByText("some_token")).toBeInTheDocument();
    });
  });
});
