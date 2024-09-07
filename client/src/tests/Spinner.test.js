import { render, screen, act } from '@testing-library/react';
import Spinner from '../components/Spinner';
import { BrowserRouter as Router } from 'react-router-dom';
import React from 'react';

/**
 * 1) Checking spinner every second for 3 seconds
 * 2) Check login call
 * 3) Check custom call
 */

const mockNavigate = jest.fn();
const mockLocation = { pathname: '/test', search: '', hash: '', state: null };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

describe('Spinner component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    render(
      <Router>
        <Spinner/>
      </Router>
    );
  })
    
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers(); 
  });

  it('renders spinner with countdown', () => {
    expect(screen.getByText(/redirecting to you in 3 second/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();

  });

  it('should decrement the countdown every second', () => {
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/redirecting to you in 2 second/i)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/redirecting to you in 1 second/i)).toBeInTheDocument();
  });

  it('should navigate to login path after countdown', () => {
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/login', { state: '/test' });
  });

  it('should navigate to a custom path after countdown', () => {
    render(
      <Router>
        <Spinner path="dashboard"/>
      </Router>
    );

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { state: '/test' });
  });
});
