import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from '../../src/components/EmptyState';

describe('T-C-7 EmptyState component', () => {
  it('shows the message', () => {
    render(
      <EmptyState message="No receipts yet. Tap Upload to add your first receipt." />,
    );
    expect(
      screen.getByText(
        'No receipts yet. Tap Upload to add your first receipt.',
      ),
    ).toBeInTheDocument();
  });

  it('shows an optional button that calls its action', async () => {
    const handleAction = jest.fn();
    render(
      <EmptyState
        message="No receipts yet. Tap Upload to add your first receipt."
        actionLabel="Upload"
        onAction={handleAction}
      />,
    );
    const btn = screen.getByRole('button', { name: 'Upload' });
    expect(btn).toBeInTheDocument();
    await userEvent.click(btn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('shows no button when no action is provided', () => {
    render(
      <EmptyState message="No receipts yet. Tap Upload to add your first receipt." />,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
