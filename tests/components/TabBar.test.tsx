import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import TabBar from '../../src/components/TabBar';

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
    [{ path: '/', element: <TabBar /> }],
    { initialEntries: ['/'] },
  );
}

describe('TabBar (T-C-11)', () => {
  beforeEach(() => mockUseSession.mockReset());

  it('shows Receipts, Export, Dashboard and Profile tabs when logged in', () => {
    render(<RouterProvider router={makeRouter(true)} />);
    expect(screen.getByRole('link', { name: /receipts/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /export/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
  });

  it('tab bar nav has aria-label "Main navigation"', () => {
    render(<RouterProvider router={makeRouter(true)} />);
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });

  it('renders nothing when logged out', () => {
    const { container } = render(<RouterProvider router={makeRouter(false)} />);
    expect(container.querySelector('nav')).toBeNull();
  });
});
