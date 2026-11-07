import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import ForgotPassword from '../../src/pages/ForgotPassword';

jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(),
    },
  },
}));

jest.mock('../../src/lib/api/auth', () => ({
  requestPasswordReset: jest.fn(),
  setNewPassword: jest.fn(),
}));

import { supabase } from '../../src/lib/supabase';
import {
  requestPasswordReset as mockResetFn,
  setNewPassword as mockSetFn,
} from '../../src/lib/api/auth';

const mockOnAuthStateChange = supabase.auth.onAuthStateChange as jest.Mock;
const mockRequestReset = mockResetFn as jest.Mock;
const mockSetNewPassword = mockSetFn as jest.Mock;

function noRecovery() {
  mockOnAuthStateChange.mockImplementation(() => ({
    data: { subscription: { unsubscribe: jest.fn() } },
  }));
}

function withRecovery() {
  mockOnAuthStateChange.mockImplementation(
    (cb: (event: string, session: unknown) => void) => {
      cb('PASSWORD_RECOVERY', { user: { id: 'uid' } });
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    },
  );
}

function makeRouter() {
  return createMemoryRouter(
    [
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/log-in', element: <div data-testid="log-in-page" /> },
      { path: '/receipts', element: <div data-testid="receipts-page" /> },
    ],
    { initialEntries: ['/forgot-password'] },
  );
}

describe('ForgotPassword (S4)', () => {
  beforeEach(() => {
    mockOnAuthStateChange.mockReset();
    mockRequestReset.mockReset();
    mockSetNewPassword.mockReset();
  });

  it('T-S4-1 request mode shows email field and Send link button', () => {
    noRecovery();
    render(<RouterProvider router={makeRouter()} />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /send link/i }),
    ).toBeInTheDocument();
  });

  it('T-S4-1 back arrow on request mode goes to /log-in', () => {
    noRecovery();
    render(<RouterProvider router={makeRouter()} />);
    expect(
      screen.getByRole('link', { name: /go back/i }),
    ).toHaveAttribute('href', '/log-in');
  });

  it('T-US2-3 request mode: any email shows the confirmation text', async () => {
    noRecovery();
    mockRequestReset.mockResolvedValueOnce(undefined);
    render(<RouterProvider router={makeRouter()} />);
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'anyone@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send link/i }));
    await waitFor(() =>
      expect(
        screen.getByText(
          /if an account exists for this email, we've sent a reset link/i,
        ),
      ).toBeInTheDocument(),
    );
  });

  it('T-US2-4 set-new-password mode shows "New password" field and "Save password" button', () => {
    withRecovery();
    render(<RouterProvider router={makeRouter()} />);
    expect(screen.getByLabelText('New password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /save password/i }),
    ).toBeInTheDocument();
  });

  it('T-US2-4 set-new-password mode: valid password saves and navigates to /receipts', async () => {
    withRecovery();
    mockSetNewPassword.mockResolvedValueOnce({ error: null });
    render(<RouterProvider router={makeRouter()} />);
    await screen.findByLabelText('New password');
    fireEvent.change(screen.getByLabelText('New password'), {
      target: { value: 'newpass1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save password/i }));
    await waitFor(() =>
      expect(screen.getByTestId('receipts-page')).toBeInTheDocument(),
    );
  });

  it('T-US2-4 set-new-password mode: invalid password shows error', async () => {
    withRecovery();
    render(<RouterProvider router={makeRouter()} />);
    await screen.findByLabelText('New password');
    const input = screen.getByLabelText('New password');
    fireEvent.change(input, { target: { value: 'short' } });
    fireEvent.blur(input);
    expect(
      screen.getByText(/at least 8 characters, including a number/i),
    ).toBeInTheDocument();
  });
});
