import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import Profile from '../../src/pages/Profile';

jest.mock('../../src/hooks/useSession', () => ({
  useSession: jest.fn(),
}));

jest.mock('../../src/lib/api/auth', () => ({
  logOut: jest.fn(),
  deleteAccount: jest.fn(),
  getProfile: jest.fn(),
}));

import { useSession as mockUseSessionFn } from '../../src/hooks/useSession';
import {
  logOut as mockLogOutFn,
  deleteAccount as mockDeleteFn,
  getProfile as mockGetProfileFn,
} from '../../src/lib/api/auth';

const mockUseSession = mockUseSessionFn as jest.Mock;
const mockLogOut = mockLogOutFn as jest.Mock;
const mockDeleteAccount = mockDeleteFn as jest.Mock;
const mockGetProfile = mockGetProfileFn as jest.Mock;

function withProfile(displayName = 'Test User', email = 'test@example.com') {
  mockUseSession.mockReturnValue({
    session: { user: { id: 'uid', email } },
    loading: false,
  });
  mockGetProfile.mockResolvedValue({ displayName, email });
}

function makeRouter() {
  return createMemoryRouter(
    [
      { path: '/profile', element: <Profile /> },
      { path: '/log-in', element: <div data-testid="log-in-page" /> },
      { path: '/receipts', element: <div data-testid="receipts-page" /> },
    ],
    { initialEntries: ['/profile'] },
  );
}

describe('Profile (S10/M3)', () => {
  beforeEach(() => {
    mockUseSession.mockReset();
    mockLogOut.mockReset();
    mockDeleteAccount.mockReset();
    mockGetProfile.mockReset();
  });

  it('T-S10-1 shows the user display name and email', async () => {
    withProfile('Zanele Dlamini', 'zanele@example.com');
    render(<RouterProvider router={makeRouter()} />);
    await waitFor(() =>
      expect(screen.getByText('Zanele Dlamini')).toBeInTheDocument(),
    );
    expect(screen.getByText('zanele@example.com')).toBeInTheDocument();
  });

  it('T-S10-1 Log out button calls logOut and navigates to /log-in', async () => {
    withProfile();
    mockLogOut.mockResolvedValueOnce(undefined);
    render(<RouterProvider router={makeRouter()} />);
    await screen.findByText('Test User');
    fireEvent.click(screen.getByRole('button', { name: /log out/i }));
    await waitFor(() =>
      expect(screen.getByTestId('log-in-page')).toBeInTheDocument(),
    );
    expect(mockLogOut).toHaveBeenCalledTimes(1);
  });

  it('T-M3-1 Delete account button shows confirmation modal', async () => {
    withProfile();
    render(<RouterProvider router={makeRouter()} />);
    await screen.findByText('Test User');
    fireEvent.click(screen.getByRole('button', { name: /delete account/i }));
    expect(
      screen.getByText(/are you sure you want to delete/i),
    ).toBeInTheDocument();
  });

  it('T-M3-1 confirming deletion calls deleteAccount and navigates to /log-in', async () => {
    withProfile();
    mockDeleteAccount.mockResolvedValueOnce({ error: null });
    render(<RouterProvider router={makeRouter()} />);
    await screen.findByText('Test User');
    fireEvent.click(screen.getByRole('button', { name: /delete account/i }));
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    await waitFor(() =>
      expect(screen.getByTestId('log-in-page')).toBeInTheDocument(),
    );
    expect(mockDeleteAccount).toHaveBeenCalledTimes(1);
  });

  it('T-M3-1 cancelling modal does NOT delete account', async () => {
    withProfile();
    render(<RouterProvider router={makeRouter()} />);
    await screen.findByText('Test User');
    fireEvent.click(screen.getByRole('button', { name: /delete account/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockDeleteAccount).not.toHaveBeenCalled();
    expect(screen.queryByTestId('log-in-page')).not.toBeInTheDocument();
  });
});
