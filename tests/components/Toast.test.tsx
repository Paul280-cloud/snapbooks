import { render, screen, act } from '@testing-library/react';
import Toast from '../../src/components/Toast';

describe('T-C-5 Toast component', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('shows the message text', () => {
    render(<Toast message="Receipt saved." onDismiss={() => undefined} />);
    expect(screen.getByText('Receipt saved.')).toBeInTheDocument();
  });

  it('calls onDismiss after 3 seconds', () => {
    const handleDismiss = jest.fn();
    render(<Toast message="Receipt saved." onDismiss={handleDismiss} />);
    act(() => jest.advanceTimersByTime(3000));
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not call onDismiss before 3 seconds', () => {
    const handleDismiss = jest.fn();
    render(<Toast message="Receipt saved." onDismiss={handleDismiss} />);
    act(() => jest.advanceTimersByTime(2999));
    expect(handleDismiss).not.toHaveBeenCalled();
  });
});
