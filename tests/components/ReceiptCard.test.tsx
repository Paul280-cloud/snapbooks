import { render, screen, fireEvent } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import ReceiptCard from '../../src/components/ReceiptCard';
import type { Receipt } from '../../src/lib/api/receipts';

const baseReceipt: Receipt = {
  id: 'rec-1',
  owner_id: 'uid',
  vendor: 'Pick n Pay',
  amount: 149.0,
  date: '2026-03-12',
  category: 'Food',
  photo_url: 'uid/rec-1.jpg',
  created_at: '2026-03-12T10:00:00Z',
  updated_at: '2026-03-12T10:00:00Z',
};

function renderCard(receipt = baseReceipt) {
  const router = createMemoryRouter(
    [
      { path: '/', element: <ReceiptCard receipt={receipt} /> },
      { path: '/receipts/:id', element: <div data-testid="receipt-detail" /> },
    ],
    { initialEntries: ['/'] },
  );
  return render(<RouterProvider router={router} />);
}

describe('T-C-12 ReceiptCard', () => {
  it('shows the vendor name', () => {
    renderCard();
    expect(screen.getByText('Pick n Pay')).toBeInTheDocument();
  });

  it('shows the date in "12 Mar 2026" format', () => {
    renderCard();
    expect(screen.getByText('12 Mar 2026')).toBeInTheDocument();
  });

  it('shows the formatted amount right-aligned as "R 149.00"', () => {
    renderCard();
    expect(screen.getByText('R 149.00')).toBeInTheDocument();
  });

  it('shows the category label', () => {
    renderCard();
    expect(screen.getByText('Food')).toBeInTheDocument();
  });

  it('shows a category colour dot', () => {
    renderCard();
    expect(screen.getByTestId('category-dot')).toBeInTheDocument();
  });

  it('navigates to /receipts/:id when tapped', () => {
    renderCard();
    fireEvent.click(screen.getByRole('link'));
    expect(screen.getByTestId('receipt-detail')).toBeInTheDocument();
  });

  it('the link href contains the receipt id', () => {
    renderCard();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/receipts/rec-1');
  });

  it('shows a Fuel card correctly', () => {
    renderCard({ ...baseReceipt, category: 'Fuel', vendor: 'BP Fuels', amount: 780.0 });
    expect(screen.getByText('BP Fuels')).toBeInTheDocument();
    expect(screen.getByText('R 780.00')).toBeInTheDocument();
    expect(screen.getByText('Fuel')).toBeInTheDocument();
  });

  it('formats dates in Jan, Feb, … Dec', () => {
    renderCard({ ...baseReceipt, date: '2026-01-20' });
    expect(screen.getByText('20 Jan 2026')).toBeInTheDocument();
  });
});
