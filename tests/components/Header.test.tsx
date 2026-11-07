import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import Header from '../../src/components/Header';

jest.mock('../../src/hooks/useSession', () => ({
  useSession: jest.fn(),
}));

import { useSession as mockUseSessionFn } from '../../src/hooks/useSession';
const mockUseSession = mockUseSessionFn as jest.Mock;

function withSession() {
  mockUseSession.mockReturnValue({
    session: { user: { id: 'uid', email: 'a@b.com' } },
    loading: false,
  });
}

function withoutSession() {
  mockUseSession.mockReturnValue({ session: null, loading: false });
}

function makeRouter(loggedIn: boolean) {
  if (loggedIn) withSession();
  else withoutSession();
  return createMemoryRouter(
    [
      {
        path: '/',
        element: <Header />,
      },
    ],
    { initialEntries: ['/'] },
  );
}

describe('Header (T-C-10)', () => {
  beforeEach(() => mockUseSession.mockReset());

  it('shows the SnapBooks logo', () => {
    render(<RouterProvider router={makeRouter(false)} />);
    expect(screen.getByAltText(/snapbooks/i)).toBeInTheDocument();
  });

  it('shows Log in link when logged out', () => {
    render(<RouterProvider router={makeRouter(false)} />);
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
  });

  it('shows Sign up link when logged out', () => {
    render(<RouterProvider router={makeRouter(false)} />);
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows Profile link when logged in', () => {
    render(<RouterProvider router={makeRouter(true)} />);
    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
  });

  it('does NOT show Log in or Sign up when logged in', () => {
    render(<RouterProvider router={makeRouter(true)} />);
    expect(screen.queryByRole('link', { name: /log in/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /sign up/i })).not.toBeInTheDocument();
  });
});
