// T-NFR-11: Tab bar on S5/S8/S9/S10; max content width 1200px; focus rings on buttons.

// jsdom doesn't implement IntersectionObserver (used by ReceiptList infinite scroll)
beforeAll(() => {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
});

jest.mock('../../src/hooks/useSession', () => ({
  useSession: jest.fn().mockReturnValue({ session: { user: { id: 'u1' } }, loading: false }),
}));
jest.mock('../../src/hooks/useOnlineStatus', () => ({
  useOnlineStatus: jest.fn().mockReturnValue(true),
}));
jest.mock('../../src/lib/api/receipts', () => ({
  listReceipts: jest.fn().mockResolvedValue({ receipts: [], count: 0 }),
}));
jest.mock('../../src/lib/api/export', () => ({
  fetchReceiptsForExport: jest.fn().mockResolvedValue([]),
}));
jest.mock('../../src/lib/api/dashboard', () => ({
  fetchDashboardData: jest.fn().mockResolvedValue([]),
}));
jest.mock('../../src/lib/api/auth', () => ({
  getProfile: jest.fn().mockResolvedValue({ displayName: 'Test', email: 't@e.com' }),
  logOut: jest.fn(),
  deleteAccount: jest.fn(),
}));
jest.mock('../../src/lib/rules/taxYear', () => ({
  taxYearFor: jest.fn().mockReturnValue({ start: '2026-03-01', end: '2027-02-28' }),
}));
jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useInfiniteQuery: jest.fn().mockReturnValue({
      data: { pages: [{ receipts: [], count: 0 }] },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    }),
  };
});

import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function makeRouter(path: string, element: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter([{ path, element }], { initialEntries: [path] });
  return <QueryClientProvider client={qc}><RouterProvider router={router} /></QueryClientProvider>;
}

// ─── Tab bar present on the right screens ────────────────────────────────────

describe('T-NFR-11 tab bar on logged-in screens', () => {
  it('S5 ReceiptList renders the tab bar navigation', async () => {
    const { default: ReceiptList } = await import('../../src/pages/ReceiptList');
    render(makeRouter('/receipts', <ReceiptList />));
    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
    });
  });

  it('S8 Export renders the tab bar navigation', async () => {
    const { default: Export } = await import('../../src/pages/Export');
    render(makeRouter('/export', <Export />));
    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
    });
  });

  it('S9 Dashboard renders the tab bar navigation', async () => {
    const { default: Dashboard } = await import('../../src/pages/Dashboard');
    render(makeRouter('/dashboard', <Dashboard />));
    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
    });
  });

  it('S10 Profile renders the tab bar navigation', async () => {
    const { default: Profile } = await import('../../src/pages/Profile');
    render(makeRouter('/profile', <Profile />));
    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
    });
  });
});

// ─── Tab bar has the right four links ────────────────────────────────────────

describe('T-NFR-11 tab bar links', () => {
  it('tab bar has Receipts, Export, Dashboard and Profile links', async () => {
    const { default: ReceiptList } = await import('../../src/pages/ReceiptList');
    render(makeRouter('/receipts', <ReceiptList />));
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /receipts/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: /export/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
  });
});

// ─── Max content width ────────────────────────────────────────────────────────

describe('T-NFR-11 max content width', () => {
  it('ReceiptList has a max-w-[1200px] container', async () => {
    const { default: ReceiptList } = await import('../../src/pages/ReceiptList');
    const { container } = render(makeRouter('/receipts', <ReceiptList />));
    await waitFor(() => {
      expect(container.querySelector('.max-w-\\[1200px\\]')).toBeInTheDocument();
    });
  });
});
