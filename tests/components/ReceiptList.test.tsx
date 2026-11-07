import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import ReceiptList from '../../src/pages/ReceiptList';
import type { Receipt } from '../../src/lib/api/receipts';

jest.mock('../../src/hooks/useSession', () => ({
  useSession: jest.fn(),
}));

jest.mock('../../src/lib/api/receipts', () => ({
  listReceipts: jest.fn(),
}));

jest.mock('../../src/hooks/useOnlineStatus', () => ({
  useOnlineStatus: jest.fn().mockReturnValue(true),
}));

import { useSession as mockUseSessionFn } from '../../src/hooks/useSession';
import { listReceipts as mockListReceiptsFn } from '../../src/lib/api/receipts';
import { useOnlineStatus as mockUseOnlineStatusFn } from '../../src/hooks/useOnlineStatus';

const mockUseSession = mockUseSessionFn as jest.Mock;
const mockListReceipts = mockListReceiptsFn as jest.Mock;
const mockUseOnlineStatus = mockUseOnlineStatusFn as jest.Mock;

function loggedIn() {
  mockUseSession.mockReturnValue({
    session: { user: { id: 'uid', email: 'a@b.com' } },
    loading: false,
  });
}

function makeReceipts(count: number, overrides?: Partial<Receipt>): Receipt[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `rec-${i + 1}`,
    owner_id: 'uid',
    vendor: `Vendor ${count - i}`,
    amount: 100 + i,
    date: `2026-03-${String(Math.min(28, 28 - i)).padStart(2, '0')}`,
    category: ((['Food', 'Stock', 'Fuel', 'Rent', 'Other'] as const)[i % 5]),
    photo_url: `uid/rec-${i + 1}.jpg`,
    created_at: `2026-03-${String(Math.min(28, 28 - i)).padStart(2, '0')}T10:00:00Z`,
    updated_at: `2026-03-${String(Math.min(28, 28 - i)).padStart(2, '0')}T10:00:00Z`,
    ...overrides,
  }));
}

let intersectionObserverCallback: IntersectionObserverCallback | null = null;

function setupIntersectionObserver() {
  intersectionObserverCallback = null;
  window.IntersectionObserver = class {
    constructor(cb: IntersectionObserverCallback) {
      intersectionObserverCallback = cb;
    }
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  } as unknown as typeof IntersectionObserver;
}

function triggerBottomVisible() {
  act(() => {
    intersectionObserverCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
  });
}

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const router = createMemoryRouter(
    [
      {
        path: '/receipts',
        element: (
          <QueryClientProvider client={qc}>
            <ReceiptList />
          </QueryClientProvider>
        ),
      },
      { path: '/receipts/new', element: <div data-testid="upload-page" /> },
      { path: '/receipts/:id', element: <div data-testid="receipt-detail" /> },
      { path: '/log-in', element: <div data-testid="log-in-page" /> },
    ],
    { initialEntries: ['/receipts'] },
  );
  return <RouterProvider router={router} />;
}

beforeEach(() => {
  mockUseSession.mockReset();
  mockListReceipts.mockReset();
  mockUseOnlineStatus.mockReturnValue(true);
  setupIntersectionObserver();
});

describe('T-BR2-3 category dropdown', () => {
  it('offers All, Food, Stock, Fuel, Rent and Other', async () => {
    loggedIn();
    mockListReceipts.mockResolvedValue({ receipts: [], count: 0 });
    render(makeWrapper());
    await waitFor(() => expect(mockListReceipts).toHaveBeenCalled());
    const select = screen.getByRole('combobox', { name: /category/i });
    const options = Array.from(select.querySelectorAll('option')).map(
      (o) => (o as HTMLOptionElement).text,
    );
    expect(options).toEqual(['All', 'Food', 'Stock', 'Fuel', 'Rent', 'Other']);
  });
});

describe('T-US4-1 pagination', () => {
  it('shows the first 20 receipts', async () => {
    loggedIn();
    const page0 = makeReceipts(20);
    mockListReceipts.mockResolvedValue({ receipts: page0, count: 25 });
    render(makeWrapper());
    await waitFor(() => expect(screen.getAllByRole('link').length).toBeGreaterThanOrEqual(20));
  });

  it('loads the next 20 when the bottom sentinel becomes visible', async () => {
    loggedIn();
    const page0 = makeReceipts(20);
    const page1 = makeReceipts(5).map((r, i) => ({ ...r, id: `extra-${i}` }));
    mockListReceipts
      .mockResolvedValueOnce({ receipts: page0, count: 25 })
      .mockResolvedValueOnce({ receipts: page1, count: 25 });
    render(makeWrapper());
    // Wait for first page and then flush all pending effects (including IntersectionObserver re-creation)
    await waitFor(() => expect(screen.getAllByRole('link').length).toBeGreaterThanOrEqual(20));
    await act(async () => {}); // flush useEffect from data-load re-render
    triggerBottomVisible();
    await waitFor(() => expect(mockListReceipts).toHaveBeenCalledTimes(2));
  });
});

describe('T-US4-2 filters', () => {
  it('calls listReceipts with the typed search text', async () => {
    loggedIn();
    mockListReceipts.mockResolvedValue({ receipts: [], count: 0 });
    render(makeWrapper());
    await waitFor(() => expect(mockListReceipts).toHaveBeenCalled());
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'Pick' } });
    await waitFor(() =>
      expect(mockListReceipts).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Pick' }),
      ),
    );
  });

  it('calls listReceipts with the selected category', async () => {
    loggedIn();
    mockListReceipts.mockResolvedValue({ receipts: [], count: 0 });
    render(makeWrapper());
    await waitFor(() => expect(mockListReceipts).toHaveBeenCalled());
    const select = screen.getByRole('combobox', { name: /category/i });
    fireEvent.change(select, { target: { value: 'Fuel' } });
    await waitFor(() =>
      expect(mockListReceipts).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'Fuel' }),
      ),
    );
  });

  it('calls listReceipts with the selected month', async () => {
    loggedIn();
    mockListReceipts.mockResolvedValue({ receipts: [], count: 0 });
    render(makeWrapper());
    await waitFor(() => expect(mockListReceipts).toHaveBeenCalled());
    const monthInput = screen.getByLabelText(/month/i);
    fireEvent.change(monthInput, { target: { value: '2026-03' } });
    await waitFor(() =>
      expect(mockListReceipts).toHaveBeenCalledWith(
        expect.objectContaining({ month: '2026-03' }),
      ),
    );
  });
});

describe('T-US4-3 empty state', () => {
  it('shows the empty state message with Upload button when there are no receipts', async () => {
    loggedIn();
    mockListReceipts.mockResolvedValue({ receipts: [], count: 0 });
    render(makeWrapper());
    await waitFor(() =>
      expect(
        screen.getByText(/no receipts yet/i),
      ).toBeInTheDocument(),
    );
    // The upload button is always present when not at limit / offline
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
  });
});

describe('T-S5-1 filtered empty state', () => {
  it('shows the filtered empty message and a Clear filters link', async () => {
    loggedIn();
    mockListReceipts.mockResolvedValue({ receipts: [], count: 0 });
    render(makeWrapper());
    await waitFor(() => expect(mockListReceipts).toHaveBeenCalled());
    // Apply a filter
    const select = screen.getByRole('combobox', { name: /category/i });
    fireEvent.change(select, { target: { value: 'Rent' } });
    await waitFor(() =>
      expect(
        screen.getByText(/no receipts match that filter/i),
      ).toBeInTheDocument(),
    );
    const clearLink = screen.getByRole('button', { name: /clear filters/i });
    expect(clearLink).toBeInTheDocument();
  });

  it('Clear filters resets the category to All', async () => {
    loggedIn();
    mockListReceipts.mockResolvedValue({ receipts: [], count: 0 });
    render(makeWrapper());
    await waitFor(() => expect(mockListReceipts).toHaveBeenCalled());
    const select = screen.getByRole('combobox', { name: /category/i });
    fireEvent.change(select, { target: { value: 'Rent' } });
    await waitFor(() => expect(screen.getByText(/no receipts match that filter/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    await waitFor(() =>
      expect(mockListReceipts).toHaveBeenCalledWith(
        expect.objectContaining({ category: undefined }),
      ),
    );
  });
});

describe('T-S5-2 loading state', () => {
  it('shows 3 grey placeholder cards while loading', () => {
    loggedIn();
    // Never resolves — query stays pending
    mockListReceipts.mockReturnValue(new Promise(() => {}));
    render(makeWrapper());
    const placeholders = screen.getAllByTestId('loading-placeholder');
    expect(placeholders.length).toBeGreaterThanOrEqual(3);
  });
});

describe('T-S5-3 error state', () => {
  it('shows the error message and a Try again button', async () => {
    loggedIn();
    mockListReceipts.mockRejectedValue(new Error('network error'));
    render(makeWrapper());
    await waitFor(() =>
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('Try again refetches', async () => {
    loggedIn();
    mockListReceipts
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce({ receipts: [], count: 0 });
    render(makeWrapper());
    await waitFor(() => expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    await waitFor(() => expect(mockListReceipts).toHaveBeenCalledTimes(2));
  });
});

describe('T-S5-4 offline state', () => {
  it('shows the offline banner when offline', async () => {
    loggedIn();
    mockUseOnlineStatus.mockReturnValue(false);
    mockListReceipts.mockResolvedValue({ receipts: makeReceipts(5), count: 5 });
    render(makeWrapper());
    await waitFor(() => expect(mockListReceipts).toHaveBeenCalled());
    expect(
      screen.getByText(/you're offline/i),
    ).toBeInTheDocument();
  });

  it('disables the upload button when offline', async () => {
    loggedIn();
    mockUseOnlineStatus.mockReturnValue(false);
    mockListReceipts.mockResolvedValue({ receipts: makeReceipts(5), count: 5 });
    render(makeWrapper());
    await waitFor(() => expect(mockListReceipts).toHaveBeenCalled());
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    expect(uploadButton).toBeDisabled();
  });
});

describe('T-S5-5 header receipt count', () => {
  it('shows the receipt count in the header', async () => {
    loggedIn();
    mockListReceipts.mockResolvedValue({ receipts: makeReceipts(14), count: 14 });
    render(makeWrapper());
    await waitFor(() => screen.getByText(/14 receipt/));
  });

  it('shows the SnapBooks wordmark in the header', async () => {
    loggedIn();
    mockListReceipts.mockResolvedValue({ receipts: [], count: 0 });
    render(makeWrapper());
    await waitFor(() => expect(mockListReceipts).toHaveBeenCalled());
    expect(screen.getByText(/snapbooks/i)).toBeInTheDocument();
  });
});

describe('T-EDGE-6 limit reached', () => {
  it('shows limit message and disables upload when count is 500', async () => {
    loggedIn();
    mockListReceipts.mockResolvedValue({ receipts: makeReceipts(20), count: 500 });
    render(makeWrapper());
    await waitFor(() =>
      expect(
        screen.getByText(/500-receipt limit/i),
      ).toBeInTheDocument(),
    );
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    expect(uploadButton).toBeDisabled();
  });

  it('existing receipts are still visible at the limit', async () => {
    loggedIn();
    const receipts = makeReceipts(20);
    mockListReceipts.mockResolvedValue({ receipts, count: 500 });
    render(makeWrapper());
    await waitFor(() => expect(screen.getAllByRole('link').length).toBeGreaterThanOrEqual(20));
  });
});
