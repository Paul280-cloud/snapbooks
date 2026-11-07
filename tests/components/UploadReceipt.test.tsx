import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import UploadReceipt from '../../src/pages/UploadReceipt';

// Mock OCR — keeps tests fast and deterministic
jest.mock('../../src/lib/api/ocr', () => ({
  readReceiptPhoto: jest.fn(),
}));

// Mock storage and receipts API
jest.mock('../../src/lib/api/storage', () => ({
  uploadPhoto: jest.fn(),
  removePhoto: jest.fn(),
}));

jest.mock('../../src/lib/api/receipts', () => ({
  createReceipt: jest.fn(),
  listReceipts: jest.fn(),
}));

jest.mock('../../src/hooks/useSession', () => ({
  useSession: jest.fn(),
}));

jest.mock('../../src/hooks/useOnlineStatus', () => ({
  useOnlineStatus: jest.fn().mockReturnValue(true),
}));

import { readReceiptPhoto as mockReadReceiptPhotoFn } from '../../src/lib/api/ocr';
import { uploadPhoto as mockUploadPhotoFn, removePhoto as mockRemovePhotoFn } from '../../src/lib/api/storage';
import { createReceipt as mockCreateReceiptFn } from '../../src/lib/api/receipts';
import { useSession as mockUseSessionFn } from '../../src/hooks/useSession';
import { useOnlineStatus as mockUseOnlineStatusFn } from '../../src/hooks/useOnlineStatus';

const mockReadReceiptPhoto = mockReadReceiptPhotoFn as jest.Mock;
const mockUploadPhoto = mockUploadPhotoFn as jest.Mock;
const mockRemovePhoto = mockRemovePhotoFn as jest.Mock;
const mockCreateReceipt = mockCreateReceiptFn as jest.Mock;
const mockUseSession = mockUseSessionFn as jest.Mock;
const mockUseOnlineStatus = mockUseOnlineStatusFn as jest.Mock;

function loggedIn(uid = 'user-1') {
  mockUseSession.mockReturnValue({
    session: { user: { id: uid, email: 'a@b.com' } },
    loading: false,
  });
}

function makeJpeg(name = 'receipt.jpg'): File {
  const content = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
  return new File([content], name, { type: 'image/jpeg' });
}

function makeWrapper(file: File | null = makeJpeg()) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter(
    [
      { path: '/receipts', element: <div data-testid="receipt-list" /> },
      {
        path: '/receipts/new',
        element: (
          <QueryClientProvider client={qc}>
            <UploadReceipt />
          </QueryClientProvider>
        ),
      },
    ],
    {
      initialEntries: [{ pathname: '/receipts/new', state: { file } }],
    },
  );
  return <RouterProvider router={router} />;
}

beforeEach(() => {
  mockUseSession.mockReset();
  mockReadReceiptPhoto.mockReset();
  mockUploadPhoto.mockReset();
  mockRemovePhoto.mockResolvedValue(undefined);
  mockCreateReceipt.mockReset();
  mockUseOnlineStatus.mockReturnValue(true);
});

describe('T-S6-2 redirect when no file in state', () => {
  it('redirects to /receipts when no file is provided', async () => {
    loggedIn();
    render(makeWrapper(null));
    await waitFor(() =>
      expect(screen.getByTestId('receipt-list')).toBeInTheDocument(),
    );
  });
});

describe('T-S6-1 OCR pre-fill', () => {
  it('shows a loading spinner while OCR is running', async () => {
    loggedIn();
    // Never resolves — OCR stays pending
    mockReadReceiptPhoto.mockReturnValue(new Promise(() => {}));
    render(makeWrapper());
    await waitFor(() =>
      expect(screen.getByRole('status')).toBeInTheDocument(),
    );
  });

  it('pre-fills the form with OCR results after scanning', async () => {
    loggedIn();
    mockReadReceiptPhoto.mockResolvedValue({
      vendor: 'Pick n Pay',
      amount: '149.00',
      date: '2026-03-12',
      category: 'Food',
    });
    render(makeWrapper());
    await waitFor(() =>
      expect(screen.getByDisplayValue('Pick n Pay')).toBeInTheDocument(),
    );
    expect(screen.getByDisplayValue('149.00')).toBeInTheDocument();
  });
});

describe('T-US3-1 form submit — happy path', () => {
  it('calls uploadPhoto then createReceipt and navigates to /receipts on success', async () => {
    loggedIn();
    mockReadReceiptPhoto.mockResolvedValue({
      vendor: 'Pick n Pay',
      amount: '149.00',
      date: '2026-03-12',
      category: 'Food',
    });
    mockUploadPhoto.mockResolvedValue('user-1/receipt.jpg');
    mockCreateReceipt.mockResolvedValue({ id: 'new-rec' });

    render(makeWrapper());
    await waitFor(() => expect(screen.getByDisplayValue('Pick n Pay')).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
    });

    await waitFor(() => expect(mockUploadPhoto).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockCreateReceipt).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByTestId('receipt-list')).toBeInTheDocument());
  });
});

describe('T-US3-2 validation', () => {
  it('shows a date validation error when Save is clicked with a future date', async () => {
    loggedIn();
    // OCR returns valid fields but a future date
    mockReadReceiptPhoto.mockResolvedValue({
      vendor: 'Pick n Pay',
      amount: '149.00',
      date: '2099-12-31',
      category: 'Food',
    });
    render(makeWrapper());
    await waitFor(() => expect(screen.getByDisplayValue('Pick n Pay')).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
    });

    await waitFor(() =>
      expect(
        screen.getByText('Enter a date that is not in the future.'),
      ).toBeInTheDocument(),
    );
  });
});

describe('T-US3-3 upload error', () => {
  it('shows an error message if uploadPhoto fails', async () => {
    loggedIn();
    mockReadReceiptPhoto.mockResolvedValue({
      vendor: 'Pick n Pay',
      amount: '149.00',
      date: '2026-03-12',
      category: 'Food',
    });
    mockUploadPhoto.mockRejectedValue(new Error('Storage error'));

    render(makeWrapper());
    await waitFor(() => expect(screen.getByDisplayValue('Pick n Pay')).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
    });

    await waitFor(() =>
      expect(screen.getByText(/could not save/i)).toBeInTheDocument(),
    );
  });
});

describe('T-US3-4 create error — cleanup', () => {
  it('removes the uploaded photo if createReceipt fails and shows an error', async () => {
    loggedIn();
    mockReadReceiptPhoto.mockResolvedValue({
      vendor: 'Pick n Pay',
      amount: '149.00',
      date: '2026-03-12',
      category: 'Food',
    });
    mockUploadPhoto.mockResolvedValue('user-1/receipt.jpg');
    mockCreateReceipt.mockRejectedValue(new Error('DB error'));

    render(makeWrapper());
    await waitFor(() => expect(screen.getByDisplayValue('Pick n Pay')).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
    });

    await waitFor(() =>
      expect(screen.getByText(/could not save/i)).toBeInTheDocument(),
    );
    expect(mockRemovePhoto).toHaveBeenCalledWith('user-1/receipt.jpg');
  });
});

describe('T-M1-1 photo preview', () => {
  it('shows the selected photo in an img element', async () => {
    loggedIn();
    mockReadReceiptPhoto.mockResolvedValue({ vendor: '', amount: '', date: '', category: 'Other' });
    render(makeWrapper());
    await waitFor(() => expect(mockReadReceiptPhoto).toHaveBeenCalled());
    // An img with the receipt photo should be visible
    const img = screen.getByRole('img', { name: /receipt/i });
    expect(img).toBeInTheDocument();
  });
});

describe('T-EDGE-2 OCR failure', () => {
  it('shows an empty form (no crash) when OCR fails', async () => {
    loggedIn();
    mockReadReceiptPhoto.mockRejectedValue(new Error('OCR failed'));
    render(makeWrapper());
    await waitFor(() => expect(mockReadReceiptPhoto).toHaveBeenCalled());
    // Form should still render with empty fields
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument(),
    );
  });
});

describe('T-EDGE-5 offline on save', () => {
  it('disables Save when offline', async () => {
    loggedIn();
    mockUseOnlineStatus.mockReturnValue(false);
    mockReadReceiptPhoto.mockResolvedValue({
      vendor: 'Pick n Pay',
      amount: '149.00',
      date: '2026-03-12',
      category: 'Food',
    });
    render(makeWrapper());
    await waitFor(() => expect(screen.getByDisplayValue('Pick n Pay')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });
});
