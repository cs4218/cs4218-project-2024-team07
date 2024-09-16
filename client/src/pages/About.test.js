import React from 'react';
import { render, screen } from '@testing-library/react';
import About from './About';

jest.mock('../components/Layout', () => ({ children, title }) => (
  <div>
    <h1>{title}</h1>
    {children}
  </div>
));

describe('About Page', () => {
  it('renders the About page with layout title', () => {
    render(<About />);

    // Check that the Layout title is rendered correctly
    expect(screen.getByText(/About us - Ecommerce app/i)).toBeInTheDocument();
  });

  it('renders the image and text', () => {
    render(<About />);

    // Check that the image is displayed with correct alt text
    const imgElement = screen.getByAltText('contactus');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', '/images/about.jpeg');

    // Check that the placeholder text is rendered
    expect(screen.getByText(/Add text/i)).toBeInTheDocument();
  });
});