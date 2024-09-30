import React, { useState } from "react";
import Layout from "./../../components/Layout";
import AdminMenu from "./../../components/AdminMenu";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import CreateProduct from "./CreateProduct";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { log } from "console";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useState: jest.fn(),
}));
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
    useState.mockImplementation(jest.requireActual("react").useState);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it("API returns null data response", async () => {
    const setCategoriesMock = jest.fn();
    jest
      .spyOn(React, "useState")
      .mockImplementationOnce(() => [[], setCategoriesMock]);

    axios.get.mockRejectedValueOnce({ data: null });

    render(<CreateProduct />);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(setCategoriesMock).not.toHaveBeenCalled();
  });

  it("API returns data response with success with category field", async () => {
    const setCategoriesMock = jest.fn();
    jest
      .spyOn(React, "useState")
      .mockImplementationOnce(() => [[], setCategoriesMock]);

    const categoriesMock = [
      { _id: "1", name: "Electronics" },
      { _id: "2", name: "Books" },
    ];

    axios.get.mockResolvedValueOnce({
      data: { success: true, category: categoriesMock },
    });

    render(<CreateProduct />);

    await waitFor(() => {
      expect(setCategoriesMock).toHaveBeenCalledWith(categoriesMock);
    });

    expect(setCategoriesMock).toHaveBeenCalledTimes(1);
  });

  it.failing("API error to get all categories", async () => {
    axios.get.mockRejectedValueOnce(new Error("Something wrong happened"));

    render(<CreateProduct />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        /Something went wrong in getting category/i
      );
    });
    // Spelling error, expected to fail
  });
});

describe("Update individual CreateProduct fields", () => {
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

    const comboBoxInput = await screen.findByText("Select a category");
    fireEvent.mouseDown(comboBoxInput);

    const electronicsOption = await screen.findByText("Electronics");
    expect(electronicsOption).toBeInTheDocument();
    fireEvent.click(electronicsOption);

    const electronicsSpan = await screen.findAllByTitle("Electronics");
    expect(electronicsSpan.length).toBe(2); // for options and in category
  });

  it("Update photo field", async () => {
    global.URL.createObjectURL = jest.fn(() => "mocked_url");
    render(<CreateProduct />);

    const file = new File(["sample photo"], "photo.jpg", {
      type: "image/jpeg",
    });

    const fileInput = screen.getByLabelText(/upload photo/i); // Make sure to add an aria-label to the input if it's not there
    fireEvent.change(fileInput, { target: { files: [file] } });

    const uploadedImage = await screen.findByAltText("product_photo");
    expect(uploadedImage).toBeInTheDocument();
    expect(uploadedImage.src).toMatch(/mocked_url$/);

    delete global.URL.createObjectURL;
  });

  it("Update name field", () => {
    render(<CreateProduct />);

    const nameInput = screen.getByPlaceholderText(/write a name/i);
    fireEvent.change(nameInput, { target: { value: "New Product Name" } });

    expect(nameInput.value).toBe("New Product Name");
  });

  it("Update description field", () => {
    render(<CreateProduct />);

    const descriptionInput =
      screen.getByPlaceholderText(/write a description/i);
    fireEvent.change(descriptionInput, {
      target: { value: "New Product Description" },
    });

    expect(descriptionInput.value).toBe("New Product Description");
  });

  it("Update price field", () => {
    render(<CreateProduct />);
    const priceInput = screen.getByPlaceholderText(/write a Price/i);
    fireEvent.change(priceInput, { target: { value: "99.99" } });

    expect(priceInput.value).toBe("99.99");
  });

  it("Update quantity field", () => {
    render(<CreateProduct />);
    const quantityInput = screen.getByPlaceholderText(/write a quantity/i);
    fireEvent.change(quantityInput, { target: { value: "99" } });

    expect(quantityInput.value).toBe("99");
  });

  it("Update shipping field", async () => {
    render(<CreateProduct />);

    const selectPlaceholder = await screen.findByText(/Select Shipping/i);
    fireEvent.mouseDown(selectPlaceholder);
    const yesOption = await screen.findByText(/Yes/i);
    fireEvent.click(yesOption);

    const selectedOption = await screen.findAllByTitle(/Yes/i);
    expect(selectedOption.length).toBe(2); // for options and in category
  });
});

describe("Create product sequence", () => {
  const mockNavigate = useNavigate();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.failing("Create product successful", async () => {
    axios.get.mockResolvedValue({ data: { success: true, category: [] } });
    axios.post.mockResolvedValueOnce({
      data: { success: true, message: "Product created" },
    });

    render(<CreateProduct />);

    const createProductButton = screen.getByRole("button", {
      name: /create product/i,
    });
    fireEvent.click(createProductButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        /Product Created Successfully/i
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
    });
    // Expected failure: toast success branch should be switched with toast error branch
  });

  it.failing("Create product unsuccessful", async () => {
    axios.get.mockResolvedValue({ data: { success: true, category: [] } });
    axios.post.mockResolvedValueOnce({
      data: { success: false, message: "Failed to create product" },
    });

    render(<CreateProduct />);

    const createProductButton = screen.getByRole("button", {
      name: /create product/i,
    });
    fireEvent.click(createProductButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to create product");
    });

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
    // Expected failure: toast success branch should be switched with toast error branch
  });

  it("Create product with exception", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

    axios.get.mockResolvedValue({ data: { success: true, category: [] } });
    axios.post.mockRejectedValueOnce(new Error("Error posting to path"));

    render(<CreateProduct />);

    const createProductButton = screen.getByRole("button", {
      name: /create product/i,
    });

    fireEvent.click(createProductButton); // Call handleCreate

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("something went wrong");
    });

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    // Restore console spy
    consoleLogSpy.mockRestore();

    // Axios post in CreateProduct handleCreate function is not awaited,
    // meaning that the data may not even be gotten before running the if 
    // else statements, leading to the wrong output.
  });
});
