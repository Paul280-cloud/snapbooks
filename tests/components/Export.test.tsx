// T-US7-1, T-US7-2, T-S8-1, T-S8-2
// Component tests for the Export page (S8).

jest.mock('../../src/lib/api/export', () => ({
  fetchReceiptsForExport: jest.fn(),
}));

jest.mock('../../src/lib/rules/export', () => ({
  buildExportRows: jest.fn().mockReturnValue([]),
  buildWorkbook: jest.fn().mockReturnValue({}),
  exportFileName: jest.fn().mockReturnValue('SnapBooks_export_2026-11-07.xlsx'),
  downloadWorkbook: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/lib/rules/taxYear', () => ({
  taxYearFor: jest.fn().mockReturnValue({ start: '2026-03-01', end: '2027-02-28' }),
}));

jest.mock('../../src/hooks/useOnlineStatus', () => ({
  useOnlineStatus: jest.fn().mockReturnValue(true),
}));

jest.mock('../../src/hooks/useSession', () => ({
  useSession: jest.fn().mockReturnValue({ session: { user: { id: 'u1' } }, loading: false }),
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import Export from '../../src/pages/Export';
import { fetchReceiptsForExport as mockFetchFn } from '../../src/lib/api/export';
import { downloadWorkbook as mockDownloadFn } from '../../src/lib/rules/export';
import { useOnlineStatus as mockUseOnlineStatusFn } from '../../src/hooks/useOnlineStatus';

const mockFetch = mockFetchFn as jest.Mock;
const mockDownload = mockDownloadFn as jest.Mock;
const mockUseOnlineStatus = mockUseOnlineStatusFn as jest.Mock;

function makeReceipt(i: number) {
  return {
    id: `r${i}`,
    owner_id: 'u1',
    vendor: `Vendor ${i}`,
    amount: 100 + i,
    date: `2026-${String(Math.min(i + 3, 12)).padStart(2, '0')}-01`,
    category: 'Food' as const,
    photo_url: `u1/r${i}.jpg`,
    created_at: `2026-03-${String(i).padStart(2, '0')}T10:00:00Z`,
    updated_at: `2026-03-${String(i).padStart(2, '0')}T10:00:00Z`,
  };
}

const RECEIPTS_FIXTURE = [makeReceipt(1), makeReceipt(2)];

function makeWrapper() {
  const router = createMemoryRouter(
    [{ path: '/export', element: <Export /> }],
    { initialEntries: ['/export'] },
  );
  return <RouterProvider router={router} />;
}

beforeEach(() => {
  mockFetch.mockReset();
  mockDownload.mockReset();
  mockFetch.mockResolvedValue(RECEIPTS_FIXTURE);
  mockDownload.mockResolvedValue(undefined);
  mockUseOnlineStatus.mockReturnValue(true);
});

// ─── T-S8-1: layout and defaults ─────────────────────────────────────────────

describe('T-S8-1 layout and defaults', () => {
  it('start and end date fields default to the current tax year', async () => {
    render(makeWrapper());

    await waitFor(() => {
      // taxYearFor is mocked to return { start: '2026-03-01', end: '2027-02-28' }
      expect(screen.getByDisplayValue('2026-03-01')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('2027-02-28')).toBeInTheDocument();
  });

  it('summary line shows the receipt count', async () => {
    render(makeWrapper());

    await waitFor(() => {
      expect(screen.getByText(/2 receipts found in this range/i)).toBeInTheDocument();
    });
  });

  it('summary line says "1 receipt" (not "receipts") for a single result', async () => {
    mockFetch.mockResolvedValue([makeReceipt(1)]);
    render(makeWrapper());

    await waitFor(() => {
      expect(screen.getByText(/1 receipt found in this range/i)).toBeInTheDocument();
    });
  });

  it('shows the note line with exact text', async () => {
    render(makeWrapper());

    await waitFor(() => {
      expect(
        screen.getByText(/file format: \.xlsx.*columns: date, vendor, category, amount \(zar\).*sorted oldest first/i),
      ).toBeInTheDocument();
    });
  });

  it('summary updates when dates change', async () => {
    mockFetch
      .mockResolvedValueOnce(RECEIPTS_FIXTURE) // initial
      .mockResolvedValueOnce([makeReceipt(1)]); // after date change

    render(makeWrapper());

    await waitFor(() => {
      expect(screen.getByText(/2 receipts found/i)).toBeInTheDocument();
    });

    // Change start date
    fireEvent.change(screen.getByLabelText(/start/i), { target: { value: '2026-06-01' } });

    await waitFor(() => {
      expect(screen.getByText(/1 receipt found/i)).toBeInTheDocument();
    });
  });
});

// ─── T-US7-1: export downloads and shows toast ────────────────────────────────

describe('T-US7-1 export', () => {
  it('calls downloadWorkbook and shows "Export ready." toast', async () => {
    render(makeWrapper());

    await waitFor(() => {
      expect(screen.getByText(/2 receipts found/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /export to spreadsheet/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Export ready.');
    });

    expect(mockDownload).toHaveBeenCalledTimes(1);
  });
});

// ─── T-US7-2: empty range ─────────────────────────────────────────────────────

describe('T-US7-2 empty range', () => {
  it('shows "No receipts in that range." when no receipts match', async () => {
    mockFetch.mockResolvedValue([]);
    render(makeWrapper());

    await waitFor(() => {
      expect(
        screen.getByText(/no receipts in that range\. adjust the dates and try again\./i),
      ).toBeInTheDocument();
    });
  });

  it('Export button is disabled when no receipts in range', async () => {
    mockFetch.mockResolvedValue([]);
    render(makeWrapper());

    await waitFor(() => {
      expect(screen.getByText(/no receipts in that range/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /export/i })).toBeDisabled();
    expect(mockDownload).not.toHaveBeenCalled();
  });
});

// ─── T-S8-2: loading/exporting states ────────────────────────────────────────

describe('T-S8-2 states', () => {
  it('Export button shows "Exporting…" while download is in progress', async () => {
    mockFetch.mockResolvedValue(RECEIPTS_FIXTURE);
    // downloadWorkbook never resolves → isExporting stays true
    mockDownload.mockImplementation(() => new Promise(() => {}));

    render(makeWrapper());

    await waitFor(() => {
      expect(screen.getByText(/2 receipts found/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /export to spreadsheet/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /exporting/i })).toBeInTheDocument();
    });
  });

  it('offline: Export button disabled and offline banner visible', async () => {
    mockUseOnlineStatus.mockReturnValue(false);
    render(makeWrapper());

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export/i })).toBeDisabled();
    });

    expect(screen.getByText(/you're offline/i)).toBeInTheDocument();
  });
});
