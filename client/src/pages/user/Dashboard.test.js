import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';
import { useAuth } from '../../context/auth';

jest.mock('../../context/auth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('../../components/UserMenu', () => () => <div>UserMenu Component</div>);

describe('Dashboard Component', () => {
  it('renders the user information correctly', () => {
    useAuth.mockReturnValue([{ user: { name: 'John Doe', email: 'john@example.com', address: '123 Main St' } }]);

    render(<Dashboard />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();

    expect(screen.getByText('UserMenu Component')).toBeInTheDocument();
  });

  it('renders without crashing when user data is undefined', () => {
    useAuth.mockReturnValue([{ user: null }]);

    render(<Dashboard />);

    expect(screen.getByText('UserMenu Component')).toBeInTheDocument();
  });
});
