import react from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from '../app/auth/register/page';
import { useAuth } from '../context/auth-context';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';


jest.mock('../context/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('RegisterPage', () => {
  const push = jest.fn();
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
    (useAuth as jest.Mock).mockReturnValue({ register: jest.fn().mockResolvedValue(undefined), user: null });
  });

  it('renders form fields and button disabled', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeDisabled();
  });

  it('shows error when fields are empty', async () => {
    render(<RegisterPage />);
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(await screen.findByText(/all fields are required/i)).toBeInTheDocument();
  });

  it('shows error when name is too short', async () => {
    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'abc' } });
    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'pass1234' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(await screen.findByText(/full name must be at least 5 characters/i)).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Valid Name' } });
    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'pass1234' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(await screen.findByText(/passwords must match/i)).toBeInTheDocument();
  });

  it('calls register and redirects on success', async () => {
    const registerMock = jest.fn().mockResolvedValue(undefined);
    (useAuth as jest.Mock).mockReturnValue({ register: registerMock, user: null });
    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Valid Name' } });
    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'pass1234' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith('Valid Name', 'test@example.com', 'pass1234');
      expect(push).toHaveBeenCalledWith('/');
    });
  });

  it('contains link to login page', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute('href', '/auth/login');
  });
});
