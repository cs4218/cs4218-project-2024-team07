import React from "react";
import { render, screen } from "@testing-library/react";
import Users from "./Users";

jest.mock("../../components/AdminMenu");
jest.mock("./../../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));

describe("Users component presence", () => {
  it("Check Users component is present", () => {
    render(<Users />);

    const titleElement = screen.getByRole("heading", { name: /All Users/i });
    expect(titleElement).toBeTruthy();
  });
});
