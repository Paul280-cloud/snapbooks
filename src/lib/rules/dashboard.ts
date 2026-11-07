import { sumRand } from './money';
import { CATEGORIES } from './categories';
import type { BarChartItem } from '../../components/BarChart';
import type { DashboardRow } from '../api/dashboard';

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatTaxYearLabel(start: string, end: string): string {
  const fmt = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${MONTH_ABBR[m - 1]} ${y}`;
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

export function computeCategoryTotals(rows: DashboardRow[]): BarChartItem[] {
  return CATEGORIES.map(cat => ({
    label: cat,
    value: sumRand(rows.filter(r => r.category === cat).map(r => r.amount)),
  }));
}

export function computeMonthTotals(rows: DashboardRow[], start: string): BarChartItem[] {
  const [startYear, startMonth] = start.split('-').map(Number);
  return Array.from({ length: 12 }, (_, i) => {
    const monthIndex = ((startMonth - 1 + i) % 12); // 0-based month index
    const year = startYear + Math.floor((startMonth - 1 + i) / 12);
    const mm = String(monthIndex + 1).padStart(2, '0');
    const prefix = `${year}-${mm}-`;
    const total = sumRand(rows.filter(r => r.date.startsWith(prefix)).map(r => r.amount));
    return { label: MONTH_ABBR[monthIndex], value: total };
  });
}
