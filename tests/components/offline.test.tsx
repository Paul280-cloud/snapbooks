// T-NFR-1: Every logged-in screen shows the offline banner when offline.
// Upload and save actions are disabled when offline.

jest.mock('../../src/hooks/useOnlineStatus', () => ({
  useOnlineStatus: jest.fn(),
}));
jest.mock('../../src/hooks/useSession', () => ({
  useSession: jest.fn().mockReturnValue({ session: { user: { id: 'u1' } }, loading: false }),
}));
jest.mock('../../src/lib/api/receipts', () => ({
  getReceipt: jest.fn().mockResolvedValue(null),
  updateReceipt: jest.fn(),
  deleteReceipt: jest.fn(),
  listReceipts: jest.fn().mockResolvedValue({ receipts: [], count: 0 }),
}));
jest.mock('../../src/lib/api/ocr', () => ({
  readReceiptPhoto: jest.fn().mockResolvedValue({ vendor: '', amount: '', date: '', category: '' }),
}));
jest.mock('../../src/lib/api/storage', () => ({
  uploadPhoto: jest.fn().mockResolvedValue('path/to/photo.jpg'),
  removePhoto: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../src/lib/api/dashboard', () => ({
  fetchDashboardData: jest.fn().mockResolvedValue([]),
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
import { useOnlineStatus as mockOnlineFn } from '../../src/hooks/useOnlineStatus';

const mockOnline = mockOnlineFn as jest.Mock;

function wrap(element: React.ReactElement, path = '/') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter([{ path, element }], { initialEntries: [path] });
  return (
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

beforeEach(() => mockOnline.mockReturnValue(false));

// ─── UploadReceipt ────────────────────────────────────────────────────────────

describe('T-NFR-1 offline — UploadReceipt (S6)', () => {
  it('shows the offline banner', async () => {
    const { default: UploadReceipt } = await import('../../src/pages/UploadReceipt');
    const file = new File(['x'], 'receipt.jpg', { type: 'image/jpeg' });
    const router = createMemoryRouter(
      [{ path: '/receipts/new', element: <UploadReceipt /> }],
      { initialEntries: [{ pathname: '/receipts/new', state: { file } }] },
    );
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={qc}><RouterProvider router={router} /></QueryClientProvider>);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByText(/you're offline/i)).toBeInTheDocument();
  });
});

// ─── Profile ─────────────────────────────────────────────────────────────────

describe('T-NFR-1 offline — Profile (S10)', () => {
  it('shows the offline banner', async () => {
    jest.mock('../../src/lib/api/auth', () => ({
      getProfile: jest.fn().mockResolvedValue({ displayName: 'Test', email: 't@e.com' }),
      logOut: jest.fn(),
      deleteAccount: jest.fn(),
    }));
    const { default: Profile } = await import('../../src/pages/Profile');
    render(wrap(<Profile />, '/profile'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByText(/you're offline/i)).toBeInTheDocument();
  });
});

// ─── Dashboard ───────────────────────────────────────────────────────────────

describe('T-NFR-1 offline — Dashboard (S9)', () => {
  it('shows the offline banner', async () => {
    const { default: Dashboard } = await import('../../src/pages/Dashboard');
    render(wrap(<Dashboard />, '/dashboard'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByText(/you're offline/i)).toBeInTheDocument();
  });
});
