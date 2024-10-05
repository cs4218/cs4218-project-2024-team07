import React from "react";
import { render, screen } from "@testing-library/react";
import AdminDashboard from "./AdminDashboard";
import { useAuth } from "../../context/auth";

jest.mock("../../context/auth");
jest.mock("../../components/AdminMenu", () => () => <div>Admin Menu</div>);
jest.mock("../../components/Layout", () => ({ children, title }) => (
  <div>
    <h1>{title}</h1>
    {children}
  </div>
));

describe("AdminDashboard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders AdminDashboard with user details", () => {
    // Mock the useAuth hook to provide user data
    useAuth.mockReturnValue([
      {
        user: {
          name: "John Doe",
          email: "john@example.com",
          phone: "123-456-7890",
        },
      },
    ]);

    render(<AdminDashboard />);

    expect(screen.getByText("Admin Menu")).toBeInTheDocument();

    expect(screen.getByText(/Admin Name : John Doe/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Admin Email : john@example.com/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Admin Contact : 123-456-7890/i)
    ).toBeInTheDocument();
  });

  it("renders AdminDashboard with missing user details", () => {
    useAuth.mockReturnValue([{}]);

    render(<AdminDashboard />);

    expect(screen.getByText(/Admin Name :/i).textContent).toBe(
      " Admin Name : "
    );
    expect(screen.getByText(/Admin Email :/i).textContent).toBe(
      " Admin Email : "
    );
    expect(screen.getByText(/Admin Contact :/i).textContent).toBe(
      " Admin Contact : "
    );
  });
});
