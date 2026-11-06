import { render, screen } from '@testing-library/react';
import LoadingPlaceholder from '../../src/components/LoadingPlaceholder';

describe('T-C-8 LoadingPlaceholder component', () => {
  it('renders grey placeholder cards', () => {
    render(<LoadingPlaceholder type="cards" count={3} />);
    const cards = screen.getAllByTestId('placeholder-card');
    expect(cards).toHaveLength(3);
    cards.forEach((card) => expect(card).toHaveClass('bg-gray'));
  });

  it('renders grey placeholder bars', () => {
    render(<LoadingPlaceholder type="bars" count={2} />);
    const bars = screen.getAllByTestId('placeholder-bar');
    expect(bars).toHaveLength(2);
    bars.forEach((bar) => expect(bar).toHaveClass('bg-gray'));
  });
});
