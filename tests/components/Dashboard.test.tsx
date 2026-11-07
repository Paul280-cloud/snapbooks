// T-US8-1, T-US8-2, T-S9-1
// Component tests for the Dashboard page (S9).

jest.mock('../../src/lib/api/dashboard', () => ({
  fetchDashboardData: jest.fn(),
}));

jest.mock('../../src/lib/rules/taxYear', () => ({
  taxYearFor: jest.fn().mockReturnValue({ start: '2026-03-01', end: '2027-02-28' }),
}));

jest.mock('../../src/hooks/useSession', () => ({
  useSession: jest.fn().mockReturnValue({ session: { user: { id: 'u1' } }, loading: false }),
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import Dashboard from '../../src/pages/Dashboard';
import { fetchDashboardData as mockFetchFn } from '../../src/lib/api/dashboard';

const mockFetch = mockFetchFn as jest.Mock;

const RECEIPTS_FIXTURE = [
  { date: '2026-03-08', amount: 780,  category: 'Fuel'  },
  { date: '2026-03-12', amount: 320,  category: 'Stock' },
  { date: '2026-04-01', amount: 150,  category: 'Food'  },
];

function makeWrapper() {
  const router = createMemoryRouter(
    [{ path: '/dashboard', element: <Dashboard /> }],
    { initialEntries: ['/dashboard'] },
  );
  return <RouterProvider router={router} />;
}

beforeEach(() => {
  mockFetch.mockReset();
  mockFetch.mockResolvedValue(RECEIPTS_FIXTURE);
});

// ─── T-US8-1: has receipts ────────────────────────────────────────────────────

describe('T-US8-1 dashboard with data', () => {
  it('shows the tax year label', async () => {
    render(makeWrapper());
    await waitFor(() => {
      expect(screen.getByText(/1 Mar 2026/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/28 Feb 2027/i)).toBeInTheDocument();
  });

  it('shows a bar chart labelled "Spend by category"', async () => {
    render(makeWrapper());
    await waitFor(() => {
      expect(
        document.querySelector('[aria-label="Spend by category"]'),
      ).toBeInTheDocument();
    });
  });

  it('shows a bar chart labelled "Spend by month"', async () => {
    render(makeWrapper());
    await waitFor(() => {
      expect(
        document.querySelector('[aria-label="Spend by month"]'),
      ).toBeInTheDocument();
    });
  });

  it('shows the total expenses line', async () => {
    render(makeWrapper());
    // Fuel 780 + Stock 320 + Food 150 = 1 250.00
    await waitFor(() => {
      expect(screen.getByText(/Total expenses: R 1 250\.00/i)).toBeInTheDocument();
    });
  });

  it('shows March as the first month in the month chart', async () => {
    render(makeWrapper());
    await waitFor(() => {
      // "Mar" should appear as a month label
      expect(screen.getAllByText(/^Mar$/i).length).toBeGreaterThan(0);
    });
  });

  it('shows February as the last month in the month chart', async () => {
    render(makeWrapper());
    await waitFor(() => {
      expect(screen.getAllByText(/^Feb$/i).length).toBeGreaterThan(0);
    });
  });
});

// ─── T-US8-2: no receipts ────────────────────────────────────────────────────

describe('T-US8-2 empty state', () => {
  it('shows the empty state message when no receipts', async () => {
    mockFetch.mockResolvedValue([]);
    render(makeWrapper());
    await waitFor(() => {
      expect(
        screen.getByText(/no data yet\. upload receipts to see your spending summary\./i),
      ).toBeInTheDocument();
    });
  });

  it('does not show the total expenses line when empty', async () => {
    mockFetch.mockResolvedValue([]);
    render(makeWrapper());
    await waitFor(() => {
      expect(screen.queryByText(/total expenses/i)).not.toBeInTheDocument();
    });
  });
});

// ─── T-S9-1: loading and error states ────────────────────────────────────────

describe('T-S9-1 loading and error states', () => {
  it('shows loading placeholder bars while fetching', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // never resolves
    render(makeWrapper());
    await waitFor(() => {
      expect(
        document.querySelectorAll('[data-testid="loading-placeholder"]').length,
      ).toBeGreaterThan(0);
    });
  });

  it('shows "Something went wrong. Try again." on fetch error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    render(makeWrapper());
    await waitFor(() => {
      expect(screen.getByText(/something went wrong\. try again\./i)).toBeInTheDocument();
    });
  });

  it('shows a "Try again" button on error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    render(makeWrapper());
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  it('"Try again" button re-fetches data', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('first fail'))
      .mockResolvedValue(RECEIPTS_FIXTURE);

    render(makeWrapper());

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    await waitFor(() => {
      expect(screen.getByText(/Total expenses/i)).toBeInTheDocument();
    });
  });
});
