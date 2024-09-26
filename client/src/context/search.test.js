import { renderHook, act } from "@testing-library/react";
import React, { useState, useContext, createContext } from "react";
import { useSearch, SearchProvider } from "./search";

// Test to ensure the default state is working as expected
describe("useSearch custom hook", () => {
  test("should return the default initial state", () => {
    const wrapper = ({ children }) => <SearchProvider>{children}</SearchProvider>;

    // Render the hook inside the provider
    const { result } = renderHook(() => useSearch(), { wrapper });

    // Initial state should have an empty keyword and empty results array
    expect(result.current[0]).toEqual({
      keyword: "",
      results: [],
    });
  });

  // Test to check state updates correctly
  test("should update the search context state", () => {
    const wrapper = ({ children }) => <SearchProvider>{children}</SearchProvider>;

    const { result } = renderHook(() => useSearch(), { wrapper });

    // Access the setAuth function from the hook
    const [, setAuth] = result.current;

    // Update the state using setAuth
    act(() => {
      setAuth({ keyword: "test", results: ["result1", "result2"] });
    });

    // Check if the state is updated correctly
    expect(result.current[0]).toEqual({
      keyword: "test",
      results: ["result1", "result2"],
    });
  });

  // Test edge cases
  test("should handle setting an empty keyword and results", () => {
    const wrapper = ({ children }) => <SearchProvider>{children}</SearchProvider>;

    const { result } = renderHook(() => useSearch(), { wrapper });

    const [, setAuth] = result.current;

    // Set an empty keyword and results
    act(() => {
      setAuth({ keyword: "", results: [] });
    });

    expect(result.current[0]).toEqual({
      keyword: "",
      results: [],
    });
  });
});