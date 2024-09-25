import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Pagenotfound from "./Pagenotfound"; 
import React from "react";


jest.mock("../context/auth", () => ({
  useAuth: () => [{ user: { name: "John", role: 1 } }, jest.fn()],
}));

jest.mock("../context/cart", () => ({
  useCart: () => [[{ id: 1, name: "Item 1" }]],
}));

jest.mock("../context/search", () => ({
  useSearch: () => [{ keyword: "", results: [] }, jest.fn()],
}));


describe("Pagenotfound Component", () => {
  it("renders the 404 message", () => {
    render(
      <MemoryRouter>
        <Pagenotfound />
      </MemoryRouter>
    );

    // Check that the 404 message is displayed
    const titleElement = screen.getByText(/404/i);
    expect(titleElement).toBeInTheDocument();
  });

  it("displays the correct heading", () => {
    render(
      <MemoryRouter>
        <Pagenotfound />
      </MemoryRouter>
    );

    // Check that the heading "Oops ! Page Not Found" is displayed
    const headingElement = screen.getByText(/Oops ! Page Not Found/i);
    expect(headingElement).toBeInTheDocument();
  });

  it("renders the Go Back link with correct URL", () => {
    render(
      <MemoryRouter>
        <Pagenotfound />
      </MemoryRouter>
    );

    // Check that the "Go Back" link is rendered and points to "/"
    const linkElement = screen.getByRole("link", { name: /Go Back/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.getAttribute("href")).toBe("/");
  });
});
