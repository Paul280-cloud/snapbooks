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

// ─── Alignment and responsive layout (bug fixes) ─────────────────────────────

describe('BarChart alignment', () => {
  it('each bar and its label are in the same SVG element (not in a sibling div)', () => {
    render(<BarChart items={ITEMS} title="Spend by category" />);
    const bar = document.querySelector('[data-testid="bar-Food"]') as SVGRectElement;
    expect(bar).not.toBeNull();
    const svg = bar.closest('svg');
    expect(svg).not.toBeNull();
    // The 'Food' text must be inside the same SVG, not a sibling div
    const textsInSvg = Array.from(svg!.querySelectorAll('text'));
    expect(textsInSvg.some(t => t.textContent === 'Food')).toBe(true);
  });

  it('bar center-x and label center-x are equal within the SVG', () => {
    render(<BarChart items={[{ label: 'Food', value: 100 }, { label: 'Fuel', value: 50 }]} title="Categories" />);
    const bar = document.querySelector('[data-testid="bar-Food"]') as SVGRectElement;
    const svg = bar.closest('svg')!;
    const barCenterX = parseFloat(bar.getAttribute('x')!) + parseFloat(bar.getAttribute('width')!) / 2;
    const labelEl = Array.from(svg.querySelectorAll('text')).find(t => t.textContent === 'Food');
    expect(labelEl).toBeDefined();
    expect(parseFloat(labelEl!.getAttribute('x')!)).toBeCloseTo(barCenterX, 0);
  });

  it('a 12-item chart is wrapped in an overflow-x-auto container', () => {
    const twelveItems = Array.from({ length: 12 }, (_, i) => ({
      label: `M${i}`,
      value: i * 10,
    }));
    const { container } = render(<BarChart items={twelveItems} title="Months" />);
    // The SVG must be inside a div with overflow-x-auto so it scrolls on small screens
    expect(container.querySelector('.overflow-x-auto')).toBeInTheDocument();
    // The SVG inside overflow-x-auto must be wider than a single-column viewport (> 300px)
    const svgEl = container.querySelector('.overflow-x-auto svg') as SVGSVGElement | null;
    expect(svgEl).not.toBeNull();
    const svgWidth = parseFloat(svgEl!.getAttribute('width') ?? '0');
    expect(svgWidth).toBeGreaterThan(300);
  });

  it('the SVG width exceeds the last column right edge so labels are never clipped', () => {
    // With 3 items × 48px col = 144px; SVG must be wider than 144 for right-edge padding
    const { container } = render(<BarChart items={ITEMS} title="Categories" />);
    const svgEl = container.querySelector('svg') as SVGSVGElement;
    const svgWidth = parseFloat(svgEl.getAttribute('width')!);
    expect(svgWidth).toBeGreaterThan(ITEMS.length * 48); // must exceed last column right edge
  });
});
