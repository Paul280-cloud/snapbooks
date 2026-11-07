import { formatRand } from '../lib/rules/money';

export interface BarChartItem {
  label: string;
  value: number;
}

interface BarChartProps {
  items: BarChartItem[];
  title: string;
}

// All layout constants are in SVG user-units.
const COL_W   = 48; // width of each column (bar + surrounding space)
const BAR_W   = 24; // width of the bar rect itself
const CHART_H = 100; // height of the bar area
const LABEL_H = 32;  // height reserved below bars for label + amount
const SVG_H   = CHART_H + LABEL_H;

export default function BarChart({ items, title }: BarChartProps) {
  const maxValue = Math.max(...items.map(i => i.value), 0);
  // Give the SVG an explicit pixel width so it never shrinks on narrow screens.
  // The overflow-x-auto wrapper handles scrolling.
  const svgWidth = Math.max(items.length * COL_W, COL_W);

  return (
    <figure aria-label={title} className="mb-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">{title}</p>
      {/* overflow-x-auto lets the chart scroll horizontally on small screens */}
      <div className="overflow-x-auto pb-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${SVG_H}`}
          width={svgWidth}
          height={SVG_H}
          aria-hidden="true"
        >
          {items.map((item, i) => {
            const cx = i * COL_W + COL_W / 2;  // column center x
            const barH = maxValue > 0 ? (item.value / maxValue) * CHART_H : 0;
            const barX = cx - BAR_W / 2;

            return (
              <g key={item.label}>
                {item.value > 0 && (
                  <rect
                    data-testid={`bar-${item.label}`}
                    x={barX}
                    y={CHART_H - barH}
                    width={BAR_W}
                    height={barH}
                    fill="#1B7F4F"
                    rx={2}
                  />
                )}
                {/* Category/month label */}
                <text
                  x={cx}
                  y={CHART_H + 13}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#6B7280"
                >
                  {item.label}
                </text>
                {/* Formatted amount */}
                <text
                  x={cx}
                  y={CHART_H + 26}
                  textAnchor="middle"
                  fontSize={8}
                  fill="#111827"
                >
                  {formatRand(item.value)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </figure>
  );
}
