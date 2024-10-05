// PrivateRoute.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import PrivateRoute from './Private';
import { useAuth } from '../../context/auth';
import axios from 'axios';
import { Outlet } from 'react-router-dom';

// Mock useAuth
jest.mock('../../context/auth', () => ({
  useAuth: jest.fn(),
}));

// Mock axios
jest.mock('axios');

// Mock Outlet
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: jest.fn(() => <div>Mocked Outlet</div>),
}));

// Mock Spinner
jest.mock('../Spinner', () => jest.fn(() => <div>Mocked Spinner</div>));

describe('PrivateRoute component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Outlet when auth token exists and user is authenticated', async () => {
    useAuth.mockReturnValue([{ token: 'mock-token' }, jest.fn()]);
    axios.get.mockResolvedValue({ data: { ok: true } });

    render(<PrivateRoute />);

    await waitFor(() => {
      expect(screen.getByText('Mocked Outlet')).toBeInTheDocument();
    });

    expect(screen.queryByText('Mocked Spinner')).not.toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/user-auth');
  });

  it('renders Spinner when auth token exists but user is not authenticated', async () => {
    useAuth.mockReturnValue([{ token: 'mock-token' }, jest.fn()]);
    axios.get.mockResolvedValue({ data: { ok: false } });

    render(<PrivateRoute />);

    await waitFor(() => {
      expect(screen.getByText('Mocked Spinner')).toBeInTheDocument();
    });

    expect(screen.queryByText('Mocked Outlet')).not.toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/user-auth');
  });

  it('renders Spinner when auth token does not exist', () => {
    useAuth.mockReturnValue([{ token: null }, jest.fn()]);

    render(<PrivateRoute />);

    expect(screen.getByText('Mocked Spinner')).toBeInTheDocument();
    expect(screen.queryByText('Mocked Outlet')).not.toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
  });
});
