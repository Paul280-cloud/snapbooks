import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmModal from '../../src/components/ConfirmModal';

describe('T-C-9 ConfirmModal component', () => {
  const defaultProps = {
    title: 'Delete receipt?',
    message: 'This will permanently remove this receipt. This cannot be undone.',
    confirmLabel: 'Yes, delete',
    confirmVariant: 'danger' as const,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    defaultProps.onConfirm.mockClear();
    defaultProps.onCancel.mockClear();
  });

  it('shows the title and message', () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText('Delete receipt?')).toBeInTheDocument();
    expect(
      screen.getByText(
        'This will permanently remove this receipt. This cannot be undone.',
      ),
    ).toBeInTheDocument();
  });

  it('the confirm button calls onConfirm', async () => {
    render(<ConfirmModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Yes, delete' }));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('the Cancel button calls onCancel', async () => {
    render(<ConfirmModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('the Escape key calls onCancel', async () => {
    render(<ConfirmModal {...defaultProps} />);
    await userEvent.keyboard('{Escape}');
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });
});
