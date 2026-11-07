import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import LogIn from '../../src/pages/LogIn';

jest.mock('../../src/lib/api/auth', () => ({
  logIn: jest.fn(),
  resendVerification: jest.fn(),
}));

import {
  logIn as mockLogInFn,
  resendVerification as mockResendFn,
} from '../../src/lib/api/auth';
const mockLogIn = mockLogInFn as jest.Mock;
const mockResend = mockResendFn as jest.Mock;

function makeRouter(state?: Record<string, unknown>) {
  return createMemoryRouter(
    [
      { path: '/log-in', element: <LogIn /> },
      { path: '/receipts', element: <div data-testid="receipts-page" /> },
      { path: '/sign-up', element: <div data-testid="sign-up-page" /> },
      { path: '/forgot-password', element: <div data-testid="forgot-page" /> },
    ],
    {
      initialEntries: [
        state ? { pathname: '/log-in', state } : '/log-in',
      ],
    },
  );
}

function fillAndSubmit(email = 'user@example.com', password = 'password1') {
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole('button', { name: /log in/i }));
}

describe('LogIn (S3)', () => {
  beforeEach(() => {
    mockLogIn.mockReset();
    mockResend.mockReset();
  });

  it('T-US2-1 navigates to /receipts on successful login', async () => {
    mockLogIn.mockResolvedValueOnce({ error: null });
    render(<RouterProvider router={makeRouter()} />);
    fillAndSubmit();
    await waitFor(() =>
      expect(screen.getByTestId('receipts-page')).toBeInTheDocument(),
    );
  });

  it('T-US2-2 shows unverified-email message with Resend email button', async () => {
    mockLogIn.mockResolvedValueOnce({ error: 'email_not_confirmed' });
    render(<RouterProvider router={makeRouter()} />);
    fillAndSubmit();
    await waitFor(() =>
      expect(
        screen.getByText(/please verify your email first/i),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByRole('button', { name: /resend email/i }),
    ).toBeInTheDocument();
  });

  it('T-AUTH-2 shows rate-limit message', async () => {
    mockLogIn.mockResolvedValueOnce({ error: 'rate_limited' });
    render(<RouterProvider router={makeRouter()} />);
    fillAndSubmit();
    await waitFor(() =>
      expect(
        screen.getByText(/too many attempts. try again in 15 minutes/i),
      ).toBeInTheDocument(),
    );
  });

  it('T-S3-1 shows "Incorrect email or password." on wrong credentials', async () => {
    mockLogIn.mockResolvedValueOnce({ error: 'invalid_credentials' });
    render(<RouterProvider router={makeRouter()} />);
    fillAndSubmit();
    await waitFor(() =>
      expect(
        screen.getByText(/incorrect email or password/i),
      ).toBeInTheDocument(),
    );
  });

  it('T-S3-1 verify banner shows only when arriving from sign-up', () => {
    render(<RouterProvider router={makeRouter({ fromSignUp: true })} />);
    expect(
      screen.getByText(
        /check your email and click the link to verify your account/i,
      ),
    ).toBeInTheDocument();
  });

  it('T-S3-1 verify banner does NOT show without fromSignUp state', () => {
    render(<RouterProvider router={makeRouter()} />);
    expect(
      screen.queryByText(/check your email/i),
    ).not.toBeInTheDocument();
  });

  it('T-S3-2 Resend email calls resendVerification and shows confirmation', async () => {
    mockLogIn.mockResolvedValueOnce({ error: 'email_not_confirmed' });
    mockResend.mockResolvedValueOnce({ error: null });
    render(<RouterProvider router={makeRouter()} />);
    fillAndSubmit();
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /resend email/i }),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: /resend email/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/verification email sent/i),
      ).toBeInTheDocument(),
    );
  });

  it('T-S3-1 "Sign up" link goes to /sign-up', () => {
    render(<RouterProvider router={makeRouter()} />);
    expect(
      screen.getByRole('link', { name: /sign up/i }),
    ).toHaveAttribute('href', '/sign-up');
  });

  it('T-S4-1 "Forgot password?" link goes to /forgot-password', () => {
    render(<RouterProvider router={makeRouter()} />);
    expect(
      screen.getByRole('link', { name: /forgot password/i }),
    ).toHaveAttribute('href', '/forgot-password');
  });
});
