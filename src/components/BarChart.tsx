import { formatRand } from '../lib/rules/money';

export interface BarChartItem {
  label: string;
  value: number;
}

interface BarChartProps {
  items: BarChartItem[];
  title: string;
}

const CHART_HEIGHT = 120;
const BAR_WIDTH = 24;
const GAP = 8;

export default function BarChart({ items, title }: BarChartProps) {
  const maxValue = Math.max(...items.map(i => i.value), 0);
  const svgWidth = items.length * (BAR_WIDTH + GAP) - GAP;

  return (
    <figure aria-label={title} className="mb-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">{title}</p>
      <svg
        viewBox={`0 0 ${svgWidth} ${CHART_HEIGHT}`}
        width="100%"
        aria-hidden="true"
        className="mb-2"
        style={{ maxHeight: `${CHART_HEIGHT}px` }}
      >
        {items.map((item, i) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * CHART_HEIGHT : 0;
          const x = i * (BAR_WIDTH + GAP);
          return item.value > 0 ? (
            <rect
              key={item.label}
              data-testid={`bar-${item.label}`}
              x={x}
              y={CHART_HEIGHT - barHeight}
              width={BAR_WIDTH}
              height={barHeight}
              fill="#1B7F4F"
              rx={3}
            />
          ) : null;
        })}
      </svg>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.map(item => (
          <div
            key={item.label}
            className="flex min-w-[56px] flex-col items-center text-center"
          >
            <span className="text-[10px] text-[#6B7280]">{item.label}</span>
            <span className="text-[10px] font-medium text-[#111827]">{formatRand(item.value)}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}
