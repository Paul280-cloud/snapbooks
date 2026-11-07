import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

jest.mock('../../src/hooks/useSession', () => ({
  useSession: jest.fn(),
}));

jest.mock('../../src/pages/ReceiptList', () => ({
  __esModule: true,
  default: () => <div data-testid="receipts-page" />,
}));

jest.mock('../../src/pages/SignUp', () => ({
  __esModule: true,
  default: () => <div data-testid="sign-up-page" />,
}));

jest.mock('../../src/pages/LogIn', () => ({
  __esModule: true,
  default: () => <div data-testid="log-in-page" />,
}));

jest.mock('../../src/pages/Profile', () => ({
  __esModule: true,
  default: () => <div data-testid="profile-page" />,
}));

jest.mock('../../src/pages/ForgotPassword', () => ({
  __esModule: true,
  default: () => <div data-testid="forgot-page" />,
}));

jest.mock(
  '../../src/pages/UploadReceipt',
  () => ({ __esModule: true, default: () => <div data-testid="upload-page" /> }),
  { virtual: true },
);

jest.mock(
  '../../src/pages/EditReceipt',
  () => ({ __esModule: true, default: () => <div data-testid="edit-receipt-page" /> }),
  { virtual: true },
);

jest.mock(
  '../../src/pages/Export',
  () => ({ __esModule: true, default: () => <div data-testid="export-page" /> }),
  { virtual: true },
);

jest.mock(
  '../../src/pages/Dashboard',
  () => ({ __esModule: true, default: () => <div data-testid="dashboard-page" /> }),
  { virtual: true },
);

import { useSession as mockUseSessionFn } from '../../src/hooks/useSession';
import App from '../../src/App';

const mockUseSession = mockUseSessionFn as jest.Mock;

function loggedIn() {
  mockUseSession.mockReturnValue({
    session: { user: { id: 'uid', email: 'a@b.com' } },
    loading: false,
  });
}

function loggedOut() {
  mockUseSession.mockReturnValue({ session: null, loading: false });
}

function routerAt(path: string) {
  return createMemoryRouter(
    [{ path: '*', element: <App /> }],
    { initialEntries: [path] },
  );
}

describe('T-NAV-2 receipt sub-routes', () => {
  beforeEach(() => mockUseSession.mockReset());

  it('logged-in user can reach /receipts/new', () => {
    loggedIn();
    render(<RouterProvider router={routerAt('/receipts/new')} />);
    expect(screen.getByTestId('upload-page')).toBeInTheDocument();
  });

  it('logged-in user can reach /receipts/:id', () => {
    loggedIn();
    render(<RouterProvider router={routerAt('/receipts/rec-1')} />);
    expect(screen.getByTestId('edit-receipt-page')).toBeInTheDocument();
  });

  it('logged-out user at /receipts/new redirects to /log-in', () => {
    loggedOut();
    render(<RouterProvider router={routerAt('/receipts/new')} />);
    expect(screen.getByTestId('log-in-page')).toBeInTheDocument();
  });

  it('logged-out user at /receipts/:id redirects to /log-in', () => {
    loggedOut();
    render(<RouterProvider router={routerAt('/receipts/rec-1')} />);
    expect(screen.getByTestId('log-in-page')).toBeInTheDocument();
  });
});

describe('T-NAV-1 route guards', () => {
  beforeEach(() => mockUseSession.mockReset());

  it('redirects logged-out user from /receipts to /log-in', () => {
    loggedOut();
    render(<RouterProvider router={routerAt('/receipts')} />);
    expect(screen.getByTestId('log-in-page')).toBeInTheDocument();
  });

  it('redirects logged-in user from /sign-up to /receipts', () => {
    loggedIn();
    render(<RouterProvider router={routerAt('/sign-up')} />);
    expect(screen.getByTestId('receipts-page')).toBeInTheDocument();
  });

  it('redirects logged-in user from /log-in to /receipts', () => {
    loggedIn();
    render(<RouterProvider router={routerAt('/log-in')} />);
    expect(screen.getByTestId('receipts-page')).toBeInTheDocument();
  });

  it('allows logged-out user to reach /sign-up', () => {
    loggedOut();
    render(<RouterProvider router={routerAt('/sign-up')} />);
    expect(screen.getByTestId('sign-up-page')).toBeInTheDocument();
  });

  it('allows logged-in user to reach /profile', () => {
    loggedIn();
    render(<RouterProvider router={routerAt('/profile')} />);
    expect(screen.getByTestId('profile-page')).toBeInTheDocument();
  });

  it('redirects logged-out user from /profile to /log-in', () => {
    loggedOut();
    render(<RouterProvider router={routerAt('/profile')} />);
    expect(screen.getByTestId('log-in-page')).toBeInTheDocument();
  });
});
