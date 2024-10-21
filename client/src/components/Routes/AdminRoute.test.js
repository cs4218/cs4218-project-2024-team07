// AdminRoute.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AdminRoute from './AdminRoute';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/auth';

jest.mock('axios');
jest.mock('../../context/auth', () => ({
  useAuth: jest.fn(),
}));
jest.mock('../Spinner', () => () => <div>Loading...</div>);

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    __esModule: true,
    ...originalModule,
    Outlet: () => <div>Protected Content</div>,
  };
});

describe('AdminRoute', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders Spinner when user is not authenticated', () => {
    useAuth.mockReturnValue([{ token: null }, jest.fn()]);

    render(
      <MemoryRouter>
        <AdminRoute />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders Spinner while checking admin auth', async () => {
    useAuth.mockReturnValue([{ token: 'valid-token' }, jest.fn()]);
    axios.get.mockResolvedValue({ data: { ok: false } });

    render(
      <MemoryRouter>
        <AdminRoute />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/admin-auth'));
  });

  test('renders Outlet when user is admin', async () => {
    useAuth.mockReturnValue([{ token: 'valid-token' }, jest.fn()]);
    axios.get.mockResolvedValue({ data: { ok: true } });

    render(
      <MemoryRouter>
        <AdminRoute />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Protected Content')).toBeInTheDocument());
  });

  test('renders Spinner when user is not admin', async () => {
    useAuth.mockReturnValue([{ token: 'valid-token' }, jest.fn()]);
    axios.get.mockResolvedValue({ data: { ok: false } });

    render(
      <MemoryRouter>
        <AdminRoute />
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/admin-auth'));
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
