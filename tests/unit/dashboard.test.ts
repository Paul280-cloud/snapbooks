// Unit tests for dashboard computation rules
import { computeMonthTotals, computeCategoryTotals } from '../../src/lib/rules/dashboard';
import type { DashboardRow } from '../../src/lib/api/dashboard';

function row(date: string, amount: number, category: DashboardRow['category']): DashboardRow {
  return { date, amount, category };
}

// Tax year starting 1 Mar 2026
const TAX_START = '2026-03-01';

describe('computeMonthTotals', () => {
  it('a receipt dated 12 Oct 2026 lands in October, not November', () => {
    const rows = [row('2026-10-12', 3300, 'Other')];
    const result = computeMonthTotals(rows, TAX_START);
    const oct = result.find(r => r.label === 'Oct');
    const nov = result.find(r => r.label === 'Nov');
    expect(oct?.value).toBe(3300);
    expect(nov?.value).toBe(0);
  });

  it('produces exactly 12 months starting from March', () => {
    const result = computeMonthTotals([], TAX_START);
    expect(result).toHaveLength(12);
    expect(result[0].label).toBe('Mar');
    expect(result[11].label).toBe('Feb');
  });

  it('month labels cross the year boundary correctly (Dec → Jan)', () => {
    const result = computeMonthTotals([], TAX_START);
    expect(result[9].label).toBe('Dec');
    expect(result[10].label).toBe('Jan');
  });

  it('receipts at the start and end of the month are counted', () => {
    const rows = [
      row('2026-03-01', 100, 'Food'), // first day of Mar
      row('2026-03-31', 200, 'Food'), // last day of Mar
    ];
    const result = computeMonthTotals(rows, TAX_START);
    expect(result.find(r => r.label === 'Mar')?.value).toBe(300);
  });

  it('a receipt in January 2027 (month 11 of the tax year) is bucketed to Jan', () => {
    const rows = [row('2027-01-15', 500, 'Rent')];
    const result = computeMonthTotals(rows, TAX_START);
    expect(result.find(r => r.label === 'Jan')?.value).toBe(500);
    expect(result.find(r => r.label === 'Feb')?.value).toBe(0);
  });
});

describe('computeCategoryTotals', () => {
  it('sums amounts per category correctly', () => {
    const rows = [
      row('2026-03-01', 100, 'Food'),
      row('2026-03-02', 200, 'Food'),
      row('2026-03-03', 300, 'Fuel'),
    ];
    const result = computeCategoryTotals(rows);
    expect(result.find(r => r.label === 'Food')?.value).toBe(300);
    expect(result.find(r => r.label === 'Fuel')?.value).toBe(300);
    expect(result.find(r => r.label === 'Other')?.value).toBe(0);
  });

  it('returns all 5 categories even when some have zero total', () => {
    const result = computeCategoryTotals([]);
    expect(result).toHaveLength(5);
    result.forEach(r => expect(r.value).toBe(0));
  });
});
