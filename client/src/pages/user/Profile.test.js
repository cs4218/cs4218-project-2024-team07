import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Profile from "./Profile"; 
import { useAuth } from "../../context/auth";
import axios from "axios";
import toast from "react-hot-toast";
import { log, error } from 'console'

jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("../../context/auth");
jest.mock("./../../components/Layout", () => ({ children }) => <div>{children}</div>)
jest.mock("../../components/UserMenu")

describe("Initialization of Profile", () => {
  const setAuthMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    // Default mock authenticated user
    useAuth.mockReturnValue([
      {
        user: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '1234567890',
          address: '123 Main St',
        },
      },
      setAuthMock,
    ]);
  });

  it('Initialize with authenticated user profile data', async () => {
    render(
      <Profile />
    );

    expect(await screen.findByDisplayValue('John Doe')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('john.doe@example.com')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('1234567890')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('123 Main St')).toBeInTheDocument();
  });
});

describe("Successful updating of Profile", () => {
  const setAuthMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    // Default mock authenticated user
    useAuth.mockReturnValue([
      {
        user: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '1234567890',
          address: '123 Main St',
        },
      },
      setAuthMock,
    ]);
  });

  it('Update when authenticated user details changes', async () => {
    const { rerender } = render(
      <Profile />
    );

    useAuth.mockReturnValue([
      {
        user: {
          email: 'jane.doe@example.com',
          name: 'Jane Doe',
          phone: '0987654321',
          address: '456 Elm St',
        },
      },
      setAuthMock,
    ]);

    rerender(
        <Profile />
    );

    expect(await screen.findByDisplayValue('Jane Doe')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('jane.doe@example.com')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('0987654321')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('456 Elm St')).toBeInTheDocument();
  });

  it("Successful update of profile", async () => {
    axios.put.mockResolvedValue({
      data: {
        updatedUser: {
          name: "Jane Smith",
          email: "jane@example.com",
          password: "123456789",
          phone: "9876543210",
          address: "456 New St",
        },
      },
    });
  
    const mockLocalStorage = {
      getItem: jest.fn().mockReturnValue(JSON.stringify({ user: { name: "John Doe", email: "", password: "", phone: "", address: "" } })),
      setItem: jest.fn(),
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  
    render(<Profile />);
  
    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), { target: { value: "Jane Smith" } });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), { target: { value: "9876543210" } });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), { target: { value: "456 New St" } });
  
    fireEvent.click(screen.getByText("UPDATE"));
  
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
    
    const expectedUser = {
      name: "Jane Smith",
      email: "jane@example.com",
      password: "123456789", 
      phone: "9876543210",
      address: "456 New St",
    };

    await waitFor(() => {
      expect(setAuthMock).toHaveBeenCalledWith({
        user: {
          name: "Jane Smith",
          email: "jane@example.com",
          password: "123456789",
          phone: "9876543210",
          address: "456 New St",
        },
      });
    });
    
    await waitFor(() => expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "auth",
      JSON.stringify({ user: expectedUser })
    ));
    expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");
  });
});

describe("Server update failure of Profile", () => {
  const setAuthMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    // Default mock authenticated user
    useAuth.mockReturnValue([
      {
        user: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '1234567890',
          address: '123 Main St',
        },
      },
      setAuthMock,
    ]);
  });

  it("Create toast error with data error from server", async () => {
    axios.put.mockResolvedValue({
      data: {
        error: "Some error",
      },
    });

    render(
      <Profile />
    );

    fireEvent.click(screen.getByText("UPDATE"));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Some error"));
  });
});

describe("Exception handling in Profile", () => {
  const setAuthMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    // Default mock authenticated user
    useAuth.mockReturnValue([
      {
        user: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '1234567890',
          address: '123 Main St',
        },
      },
      setAuthMock,
    ]);
  });

  it("Exception when localStorage getItem is null", async () => {
    axios.put.mockResolvedValue({
      data: {
        updatedUser: {
          name: "Jane Smith",
          email: "john@example.com",
          phone: "9876543210",
          address: "456 New St",
        },
      },
    });

    const mockLocalStorage = {
      getItem: jest.fn().mockReturnValue(null),
      setItem: jest.fn(),
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    render(<Profile />);

    fireEvent.click(screen.getByText("UPDATE"));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Something went wrong"));
  });

  it("Exception when localStorage has malformed JSON", async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    axios.put.mockResolvedValue({
      data: {
        updatedUser: {
          name: "Jane Smith",
          email: "john@example.com",
          phone: "9876543210",
          address: "456 New St",
        },
      },
    });

    const mockLocalStorage = {
      getItem: jest.fn().mockReturnValue("malformed JSON"),
      setItem: jest.fn(),
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    render(<Profile />);

    fireEvent.click(screen.getByText("UPDATE"));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error)));
    expect(toast.error).toHaveBeenCalledWith("Something went wrong")
  });
});

