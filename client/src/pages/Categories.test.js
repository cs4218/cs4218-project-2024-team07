import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Categories from "./Categories"; 
import useCategory from "../hooks/useCategory";
import slugify from "slugify";

jest.mock("../hooks/useCategory");
jest.mock('../components/Layout', () => ({ children }) => <div>{children}</div>);

describe("Categories Component", () => {
  it("renders categories and links correctly", () => {
    useCategory.mockReturnValue([
      { name: "Category 1", slug: slugify("category-1")},
      { name: "Category 2", slug: slugify("category-2") },
    ]);

    render(
      <Router>
        <Categories />
      </Router>
    );

    expect(screen.getByText("Category 1")).toBeInTheDocument();
    expect(screen.getByText("Category 2")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Category 1" })).toHaveAttribute(
      "href",
      "/category/category-1"
    );
    expect(screen.getByRole("link", { name: "Category 2" })).toHaveAttribute(
      "href",
      "/category/category-2"
    );
  });
});
