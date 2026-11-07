// T-C-14: BarChart component
import { render, screen } from '@testing-library/react';
import BarChart from '../../src/components/BarChart';

const ITEMS = [
  { label: 'Food',  value: 100 },
  { label: 'Fuel',  value: 50  },
  { label: 'Stock', value: 25  },
];

const ITEMS_WITH_ZERO = [
  { label: 'Food',  value: 100 },
  { label: 'Rent',  value: 0   },
  { label: 'Other', value: 50  },
];

describe('T-C-14 BarChart', () => {
  it('renders a bar element for each non-zero item', () => {
    render(<BarChart items={ITEMS} title="Spend by category" />);
    expect(document.querySelectorAll('[data-testid^="bar-"]')).toHaveLength(3);
  });

  it('bar heights are in proportion (100:50 = 2:1)', () => {
    render(<BarChart items={ITEMS} title="Spend by category" />);
    const foodH  = parseFloat(document.querySelector('[data-testid="bar-Food"]')!.getAttribute('height')!);
    const fuelH  = parseFloat(document.querySelector('[data-testid="bar-Fuel"]')!.getAttribute('height')!);
    expect(foodH / fuelH).toBeCloseTo(2, 1);
  });

  it('a zero-value item shows no bar but its label is still visible', () => {
    render(<BarChart items={ITEMS_WITH_ZERO} title="Spend by category" />);
    // No bar rect for Rent
    expect(document.querySelector('[data-testid="bar-Rent"]')).toBeNull();
    // Label text still present
    expect(screen.getByText('Rent')).toBeInTheDocument();
  });

  it('the chart has an accessible name via aria-label', () => {
    render(<BarChart items={ITEMS} title="Spend by category" />);
    expect(
      document.querySelector('[aria-label="Spend by category"]'),
    ).toBeInTheDocument();
  });

  it('every item has a visible text label (meaning not shown by colour alone)', () => {
    render(<BarChart items={ITEMS} title="Spend by category" />);
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Fuel')).toBeInTheDocument();
    expect(screen.getByText('Stock')).toBeInTheDocument();
  });

  it('shows the formatted rand value beside each label', () => {
    render(<BarChart items={ITEMS} title="Spend by category" />);
    expect(screen.getByText('R 100.00')).toBeInTheDocument();
    expect(screen.getByText('R 50.00')).toBeInTheDocument();
    expect(screen.getByText('R 25.00')).toBeInTheDocument();
  });

  it('renders correctly with a single item', () => {
    render(<BarChart items={[{ label: 'Fuel', value: 780 }]} title="Categories" />);
    expect(document.querySelector('[data-testid="bar-Fuel"]')).toBeInTheDocument();
    expect(screen.getByText('R 780.00')).toBeInTheDocument();
  });

  it('renders an empty chart without crashing when all values are zero', () => {
    render(<BarChart items={[{ label: 'Food', value: 0 }]} title="Categories" />);
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="bar-Food"]')).toBeNull();
  });
});
