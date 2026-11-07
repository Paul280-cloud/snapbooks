// T-S8-3: taxYearFor
import { taxYearFor } from '../../src/lib/rules/taxYear';

describe('T-S8-3 taxYearFor', () => {
  it('gives 1 Mar 2025 to 28 Feb 2026 for 28 Feb 2026 (UTC noon)', () => {
    const result = taxYearFor(new Date('2026-02-28T12:00:00Z'));
    expect(result.start).toBe('2025-03-01');
    expect(result.end).toBe('2026-02-28');
  });

  it('gives 1 Mar 2026 to 28 Feb 2027 for 1 Mar 2026 (UTC noon)', () => {
    const result = taxYearFor(new Date('2026-03-01T12:00:00Z'));
    expect(result.start).toBe('2026-03-01');
    expect(result.end).toBe('2027-02-28');
  });

  it('gives 1 Mar 2027 to 29 Feb 2028 for 29 Feb 2028 — leap year end', () => {
    const result = taxYearFor(new Date('2028-02-29T12:00:00Z'));
    expect(result.start).toBe('2027-03-01');
    expect(result.end).toBe('2028-02-29');
  });

  it('uses SAST: 22:30 UTC on 28 Feb 2026 = 00:30 SAST on 1 Mar 2026 → new tax year', () => {
    // 22:30 UTC 28 Feb = 00:30 SAST 1 Mar → tax year starting 1 Mar 2026
    const result = taxYearFor(new Date('2026-02-28T22:30:00Z'));
    expect(result.start).toBe('2026-03-01');
    expect(result.end).toBe('2027-02-28');
  });
});
