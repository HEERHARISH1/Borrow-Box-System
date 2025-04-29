import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../app/auth/login/page';
import { useAuth } from '../context/auth-context';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';


jest.mock('../context/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('LoginPage', () => {
  const push = jest.fn();
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
    (useAuth as jest.Mock).mockReturnValue({ login: jest.fn().mockResolvedValue(undefined), user: null });
  });

  it('renders form inputs and button disabled', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeDisabled();
  });

  it('shows error when fields are empty', async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByText(/email and password are required/i)).toBeInTheDocument();
  });

  it('enables button when inputs are filled', () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    expect(screen.getByRole('button', { name: /log in/i })).toBeEnabled();
  });

  it('calls login and redirects on success', async () => {
    const loginMock = jest.fn().mockResolvedValue(undefined);
    (useAuth as jest.Mock).mockReturnValue({ login: loginMock, user: null });
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(push).toHaveBeenCalledWith('/');
    });
  });

  it('shows error message on login failure', async () => {
    const loginMock = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
    (useAuth as jest.Mock).mockReturnValue({ login: loginMock, user: null });
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('contains link to register page', () => {
    render(<LoginPage />);
    expect(screen.getByRole('link', { name: /register/i })).toHaveAttribute('href', '/auth/register');
  });
});
