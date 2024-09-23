import React, { useState } from "react";
import Layout from "./../../components/Layout";
import AdminMenu from "./../../components/AdminMenu";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import CreateProduct from "./CreateProduct";
import toast from "react-hot-toast";
import axios from "axios";
import { Select } from "antd";
import { useNavigate } from "react-router-dom";
const { Option } = Select;

jest.mock('react', ()=>({
    ...jest.requireActual('react'),
    useState: jest.fn()
  }))
jest.mock("./../../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));
jest.mock("../../components/AdminMenu");
jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

describe("Get categories from API in CreateProduct", () => {
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    useState.mockImplementation(jest.requireActual('react').useState);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it("API returns null data response", async () => {
    const setCategoriesMock = jest.fn();
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [[], setCategoriesMock]);

    axios.get.mockRejectedValueOnce({ data: null });

    render(<CreateProduct />);
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(setCategoriesMock).not.toHaveBeenCalled();
  });

  it("API returns data response without success with category field", async () => {
    const setCategoriesMock = jest.fn();
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [[], setCategoriesMock]);

    axios.get.mockRejectedValueOnce({ data: { category: [] } });

    render(<CreateProduct />);
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(setCategoriesMock).not.toHaveBeenCalled();
  });

  it("API returns data response with success without category field", async () => {
    const setCategoriesMock = jest.fn();
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [[], setCategoriesMock]);

    axios.get.mockRejectedValueOnce({ data: { success: true } });

    render(<CreateProduct />);
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(setCategoriesMock).not.toHaveBeenCalled();
  });

  it("API returns data response with success with category field", async () => {
    const setCategoriesMock = jest.fn();
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [[], setCategoriesMock]);

    const categoriesMock = [
      { _id: '1', name: 'Electronics' },
      { _id: '2', name: 'Books' },
    ];
    
    axios.get.mockResolvedValueOnce({ data: { success: true, category: categoriesMock } });

    render(<CreateProduct />);
    
    await waitFor(() => {
      expect(setCategoriesMock).toHaveBeenCalledWith(categoriesMock);
    });

    expect(setCategoriesMock).toHaveBeenCalledTimes(1);
  });
});


describe("Update CreateProduct", () => {
    let consoleLogSpy;
  
    beforeEach(() => {
      jest.clearAllMocks();
      consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    });
  
    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

  it("Update category field", async () => {
    const categoriesMock = [
      { _id: "1", name: "Electronics" },
      { _id: "2", name: "Books" },
    ];
    axios.get.mockResolvedValueOnce({
      data: { success: true, category: categoriesMock },
    });

    render(<CreateProduct />);
    const selectPlaceholder = await screen.findByText("Select a category");

    fireEvent.mouseDown(selectPlaceholder);

    const electronicsOption = await screen.findByText("Electronics");
    const booksOption = await screen.findByText("Books");

    expect(electronicsOption).toBeInTheDocument();
    expect(booksOption).toBeInTheDocument();

    fireEvent.click(electronicsOption);

    expect(electronicsOption).toBeInTheDocument();
    expect(selectPlaceholder.textContent).toBe("Electronics");
  });
});
