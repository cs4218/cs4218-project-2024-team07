import React from "react";
import { render, screen, act } from "@testing-library/react";
import Spinner from "../components/Spinner";
import { BrowserRouter as Router } from "react-router-dom";

const mockNavigate = jest.fn();
const mockLocation = { pathname: "/test", search: "", hash: "", state: null };

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

describe("Spinner component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it("Initialization of spinner with countdown", () => {
    render(
      <Router>
        <Spinner />
      </Router>
    );
    expect(
      screen.getByText(/redirecting to you in 3 second/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("Decrement the spinner countdown every second", () => {
    render(
      <Router>
        <Spinner />
      </Router>
    );
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(
      screen.getByText(/redirecting to you in 2 second/i)
    ).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(
      screen.getByText(/redirecting to you in 1 second/i)
    ).toBeInTheDocument();
  });

  it("Navigate to login path after countdown", () => {
    render(
      <Router>
        <Spinner />
      </Router>
    );
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(mockNavigate).toHaveBeenCalledWith("/login", { state: "/test" });
  });

  it("Navigate to a custom path after countdown", () => {
    render(
      <Router>
        <Spinner path="dashboard" />
      </Router>
    );

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { state: "/test" });
  });
});
