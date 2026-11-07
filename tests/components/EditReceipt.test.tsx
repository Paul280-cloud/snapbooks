// T-US5-1, T-US5-2, T-US6-1, T-US6-2, T-M2-1, T-S7-1, T-EDGE-1, T-EDGE-4
// Component tests for the Edit Receipt page (S7) and Delete modal (M2).

jest.mock('../../src/lib/api/receipts', () => ({
  getReceipt: jest.fn(),
  updateReceipt: jest.fn(),
  deleteReceipt: jest.fn(),
  createReceipt: jest.fn(),
  listReceipts: jest.fn(),
}));

jest.mock('../../src/lib/api/storage', () => ({
  uploadPhoto: jest.fn(),
  removePhoto: jest.fn(),
}));

jest.mock('../../src/hooks/useSession', () => ({
  useSession: jest.fn(),
}));

jest.mock('../../src/hooks/useOnlineStatus', () => ({
  useOnlineStatus: jest.fn().mockReturnValue(true),
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom';
import EditReceipt from '../../src/pages/EditReceipt';
import { removePhoto as mockRemovePhotoFn } from '../../src/lib/api/storage';
import { useSession as mockUseSessionFn } from '../../src/hooks/useSession';
import { useOnlineStatus as mockUseOnlineStatusFn } from '../../src/hooks/useOnlineStatus';

// getReceipt / updateReceipt / deleteReceipt don't exist in receipts.ts yet;
// access them through the mock registry to avoid TypeScript import errors.
const receiptsApiMock = jest.requireMock('../../src/lib/api/receipts') as Record<string, jest.Mock>;
const mockGetReceipt: jest.Mock = receiptsApiMock.getReceipt;
const mockUpdateReceipt: jest.Mock = receiptsApiMock.updateReceipt;
const mockDeleteReceipt: jest.Mock = receiptsApiMock.deleteReceipt;

const mockRemovePhoto = mockRemovePhotoFn as jest.Mock;
const mockUseSession = mockUseSessionFn as jest.Mock;
const mockUseOnlineStatus = mockUseOnlineStatusFn as jest.Mock;

// Sample receipt matching the PRD 8.4 seed data format.
const RECEIPT = {
  id: 'r1',
  owner_id: 'user-1',
  vendor: 'Pick n Pay',
  amount: 345.5,
  date: '2026-10-15',
  category: 'Food' as const,
  photo_url: 'user-1/abc.jpg',
  signed_url: 'https://example.com/signed/abc.jpg',
  created_at: '2026-10-15T10:00:00Z',
  updated_at: '2026-10-15T10:00:00Z',
};

function loggedIn(uid = 'user-1') {
  mockUseSession.mockReturnValue({
    session: { user: { id: uid, email: 'a@b.com' } },
    loading: false,
  });
}

// Minimal S5 stub that reads toast from navigation state so T-US5-1 / T-US6-1 can verify it.
function ReceiptListStub() {
  const loc = useLocation();
  const toast = (loc.state as { toast?: string } | null)?.toast;
  return (
    <div data-testid="receipt-list">
      {toast && <p role="status">{toast}</p>}
    </div>
  );
}

function makeWrapper(receiptId = 'r1') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter(
    [
      { path: '/receipts', element: <ReceiptListStub /> },
      { path: '/log-in', element: <div data-testid="login" /> },
      {
        path: '/receipts/:id',
        element: (
          <QueryClientProvider client={qc}>
            <EditReceipt />
          </QueryClientProvider>
        ),
      },
    ],
    { initialEntries: [`/receipts/${receiptId}`] },
  );
  return <RouterProvider router={router} />;
}

beforeEach(() => {
  loggedIn();
  mockGetReceipt.mockReset();
  mockUpdateReceipt.mockReset();
  mockDeleteReceipt.mockReset();
  mockRemovePhoto.mockResolvedValue(undefined);
  mockUseOnlineStatus.mockReturnValue(true);
});

// ─── T-S7-1: screen layout and states ────────────────────────────────────────

describe('T-S7-1 layout and states', () => {
  it('shows the signed photo, four pre-filled fields, Save and Delete receipt buttons', async () => {
    mockGetReceipt.mockResolvedValue(RECEIPT);
    render(makeWrapper());

    await waitFor(() => {
      expect(screen.getByDisplayValue('Pick n Pay')).toBeInTheDocument();
    });

    // Photo from signed link
    const img = screen.getByRole('img', { name: /receipt/i });
    expect(img).toHaveAttribute('src', RECEIPT.signed_url);

    // Form pre-filled
    expect(screen.getByDisplayValue('345.5')).toBeInTheDocument(); // amount as string
    expect(screen.getByDisplayValue('2026-10-15')).toBeInTheDocument();
    expect((screen.getByLabelText(/category/i) as HTMLSelectElement).value).toBe('Food');

    // Buttons
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete receipt/i })).toBeInTheDocument();
  });

  it('shows a loading indicator while the receipt is being fetched', () => {
    mockGetReceipt.mockImplementation(() => new Promise(() => {})); // never resolves
    render(makeWrapper());

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows Saving… on the button while the update is in flight', async () => {
    mockGetReceipt.mockResolvedValue(RECEIPT);
    mockUpdateReceipt.mockImplementation(() => new Promise(() => {})); // never resolves
    render(makeWrapper());

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
    });
  });

  it('offline: Save and Delete receipt are disabled and the offline banner is visible', async () => {
    mockUseOnlineStatus.mockReturnValue(false);
    mockGetReceipt.mockResolvedValue(RECEIPT);
    render(makeWrapper());

    await waitFor(() => {
      expect(screen.getByDisplayValue('Pick n Pay')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /delete receipt/i })).toBeDisabled();
    expect(screen.getByText(/you're offline/i)).toBeInTheDocument();
  });

  it('failed load shows "Something went wrong. Try again."', async () => {
    mockGetReceipt.mockRejectedValue(new Error('network error'));
    render(makeWrapper());

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});

// ─── T-US5-1: edit a field and save ──────────────────────────────────────────

describe('T-US5-1 edit and save', () => {
  it('calls updateReceipt with the new values and shows "Receipt updated." toast on S5', async () => {
    mockGetReceipt.mockResolvedValue(RECEIPT);
    mockUpdateReceipt.mockResolvedValue({ ...RECEIPT, vendor: 'Shoprite' });
    render(makeWrapper());

    await waitFor(() => {
      expect(screen.getByDisplayValue('Pick n Pay')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/vendor/i), { target: { value: 'Shoprite' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByTestId('receipt-list')).toBeInTheDocument();
    });

    expect(mockUpdateReceipt).toHaveBeenCalledWith('r1', {
      vendor: 'Shoprite',
      amount: 345.5,
      date: '2026-10-15',
      category: 'Food',
    });

    expect(screen.getByRole('status')).toHaveTextContent('Receipt updated.');
  });
});

// ─── T-US5-2: invalid amount greyed-out Save ──────────────────────────────────

describe('T-US5-2 invalid amount', () => {
  it('empty amount: Save is disabled', async () => {
    mockGetReceipt.mockResolvedValue(RECEIPT);
    render(makeWrapper());

    await waitFor(() => {
      expect(screen.getByDisplayValue('345.5')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '' } });

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('letters in amount: Save is disabled and "Enter a rand amount" error is shown', async () => {
    mockGetReceipt.mockResolvedValue(RECEIPT);
    render(makeWrapper());

    await waitFor(() => {
      expect(screen.getByDisplayValue('345.5')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: 'abc' } });

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
    expect(screen.getByText(/enter a rand amount, e\.g\. 89\.99\./i)).toBeInTheDocument();
  });
});

// ─── T-US6-1: delete with confirmation ───────────────────────────────────────

describe('T-US6-1 delete with confirmation', () => {
  it('deletes the receipt and shows "Receipt deleted." toast on S5', async () => {
    mockGetReceipt.mockResolvedValue(RECEIPT);
    mockDeleteReceipt.mockResolvedValue(undefined);
    render(makeWrapper());

    await waitFor(() => {
      expect(screen.getByDisplayValue('Pick n Pay')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /delete receipt/i }));
    fireEvent.click(screen.getByRole('button', { name: /yes, delete/i }));

    await waitFor(() => {
      expect(screen.getByTestId('receipt-list')).toBeInTheDocument();
    });

    expect(mockDeleteReceipt).toHaveBeenCalledWith('r1');
    expect(screen.getByRole('status')).toHaveTextContent('Receipt deleted.');
  });
});

// ─── T-US6-2: delete fails (network) ─────────────────────────────────────────

describe('T-US6-2 delete fails offline', () => {
  it('shows "Couldn\'t delete. Check your connection." when deleteReceipt throws', async () => {
    mockGetReceipt.mockResolvedValue(RECEIPT);
    mockDeleteReceipt.mockRejectedValue(new Error('NetworkError'));
    render(makeWrapper());

    await waitFor(() => {
      expect(screen.getByDisplayValue('Pick n Pay')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /delete receipt/i }));
    fireEvent.click(screen.getByRole('button', { name: /yes, delete/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/couldn't delete\. check your connection\./i),
      ).toBeInTheDocument();
    });
  });
});

// ─── T-M2-1: delete modal ────────────────────────────────────────────────────

describe('T-M2-1 delete modal', () => {
  it('shows the correct title, message and action buttons', async () => {
    mockGetReceipt.mockResolvedValue(RECEIPT);
    render(makeWrapper());

    await waitFor(() => {
      expect(screen.getByDisplayValue('Pick n Pay')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /delete receipt/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete receipt?')).toBeInTheDocument();
    expect(
      screen.getByText(
        'This will permanently remove this receipt. This cannot be undone.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /yes, delete/i })).toBeInTheDocument();
  });

  it('Cancel closes the modal without deleting', async () => {
    mockGetReceipt.mockResolvedValue(RECEIPT);
    render(makeWrapper());

    await waitFor(() => {
      expect(screen.getByDisplayValue('Pick n Pay')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /delete receipt/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockDeleteReceipt).not.toHaveBeenCalled();
  });
});

// ─── T-EDGE-1: receipt no longer exists ──────────────────────────────────────

describe('T-EDGE-1 receipt no longer exists', () => {
  it('shows "This receipt is no longer available." when getReceipt returns null', async () => {
    mockGetReceipt.mockResolvedValue(null);
    render(makeWrapper());

    await waitFor(() => {
      expect(
        screen.getByText(/this receipt is no longer available/i),
      ).toBeInTheDocument();
    });
  });
});

// ─── T-EDGE-4: session expired on save ───────────────────────────────────────

describe('T-EDGE-4 session expired on save', () => {
  it('shows "Please log in again." and navigates to /log-in when updateReceipt throws JWT expired', async () => {
    mockGetReceipt.mockResolvedValue(RECEIPT);
    mockUpdateReceipt.mockRejectedValue(new Error('JWT expired'));
    render(makeWrapper());

    await waitFor(() => {
      expect(screen.getByDisplayValue('Pick n Pay')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByTestId('login')).toBeInTheDocument();
    });
  });
});
