import React from "react";
import { render, screen } from "@testing-library/react";
import Policy from "./Policy";

jest.mock("./../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));

describe("Policy component presence", () => {
  it("Check Policy component is present", () => {
    render(<Policy />);

    const imageElement = screen.getByAltText(/contactus/i);
    expect(imageElement).toBeTruthy(); 

    const paragraphElements = screen.getAllByText(/add privacy policy/i);
    expect(paragraphElements.length).toBe(7);
  });
});
