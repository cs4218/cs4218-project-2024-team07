import React from "react";
import { render, screen } from "@testing-library/react";
import Contact from "../pages/Contact"; 
import "@testing-library/jest-dom/extend-expect"; 

// Mock the Layout component as we don't need to test that here
jest.mock("./../components/Layout", () => ({ children, title }) => (
  <div>
    <div>{title}</div>
    <div>{children}</div>
  </div>
));

// just need to ensure that the page is rendered correctly.
describe("Contact Component", () => {
  test("renders contact heading", () => {
    render(<Contact />);
    
    // Check if the CONTACT US heading is present
    const heading = screen.getByRole("heading", { name: /contact us/i });
    expect(heading).toBeInTheDocument();
  });

  test("renders the contact image", () => {
    render(<Contact />);
    
    // Check if the image with alt text "contactus" is present
    const image = screen.getByAltText("contactus");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/images/contactus.jpeg");
  });

  test("renders email, phone, and support contact info", () => {
    render(<Contact />);
    
    // Check if email is correctly rendered
    const email = screen.getByText(/www.help@ecommerceapp.com/i);
    expect(email).toBeInTheDocument();
    
    // Check if phone is correctly rendered
    const phone = screen.getByText(/012-3456789/i);
    expect(phone).toBeInTheDocument();
    
    // Check if toll-free support number is correctly rendered
    const support = screen.getByText(/1800-0000-0000/i);
    expect(support).toBeInTheDocument();
  });
});