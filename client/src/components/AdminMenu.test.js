import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminMenu from './AdminMenu';

describe('AdminMenu Component', () => {
  test('renders the admin panel heading', () => {
    render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );

    const headingElement = screen.getByRole('heading', { name: /Admin Panel/i });
    expect(headingElement).toBeInTheDocument();
  });

  test('renders all navigation links with correct paths and text', () => {
    render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );

    const links = [
      { text: 'Create Category', path: '/dashboard/admin/create-category' },
      { text: 'Create Product', path: '/dashboard/admin/create-product' },
      { text: 'Products', path: '/dashboard/admin/products' },
      { text: 'Orders', path: '/dashboard/admin/orders' },
    ];

    links.forEach(({ text, path }) => {
      const linkElement = screen.getByRole('link', { name: text });
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute('href', path);
    });
  });
});
