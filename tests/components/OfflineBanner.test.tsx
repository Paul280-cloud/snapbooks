import { render, screen } from '@testing-library/react';
import OfflineBanner from '../../src/components/OfflineBanner';

describe('T-C-6 OfflineBanner component', () => {
  it('is visible with the exact text when offline', () => {
    render(<OfflineBanner offline={true} />);
    expect(
      screen.getByText("You're offline. Changes will not be saved."),
    ).toBeInTheDocument();
  });

  it('is hidden when online', () => {
    render(<OfflineBanner offline={false} />);
    expect(
      screen.queryByText("You're offline. Changes will not be saved."),
    ).not.toBeInTheDocument();
  });
});
