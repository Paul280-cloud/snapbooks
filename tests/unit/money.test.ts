import { formatRand, parseAmount, sumRand } from '../../src/lib/rules/money';

describe('T-BR7-1 formatRand', () => {
  it('formats 149 as "R 149.00"', () => {
    expect(formatRand(149)).toBe('R 149.00');
  });

  it('formats 149.00 as "R 149.00"', () => {
    expect(formatRand(149.0)).toBe('R 149.00');
  });

  it('formats 1200 as "R 1 200.00" (space as thousands separator)', () => {
    expect(formatRand(1200)).toBe('R 1 200.00');
  });

  it('formats 14350 as "R 14 350.00"', () => {
    expect(formatRand(14350)).toBe('R 14 350.00');
  });

  it('formats 999999.99 as "R 999 999.99"', () => {
    expect(formatRand(999999.99)).toBe('R 999 999.99');
  });

  it('formats 0.01 as "R 0.01"', () => {
    expect(formatRand(0.01)).toBe('R 0.01');
  });

  it('formats 1000 as "R 1 000.00"', () => {
    expect(formatRand(1000)).toBe('R 1 000.00');
  });
});

describe('T-BR7-2 parseAmount', () => {
  it('parses "149.00" to 149', () => {
    expect(parseAmount('149.00')).toBe(149);
  });

  it('parses "1 200.00" (space thousands separator) to 1200', () => {
    expect(parseAmount('1 200.00')).toBe(1200);
  });

  it('parses "1,200.00" (comma thousands separator) to 1200', () => {
    expect(parseAmount('1,200.00')).toBe(1200);
  });

  it('parses "89,99" (comma as decimal) to 89.99', () => {
    expect(parseAmount('89,99')).toBe(89.99);
  });

  it('parses "R 149.00" (with R prefix) to 149', () => {
    expect(parseAmount('R 149.00')).toBe(149);
  });

  it('returns null for an empty string', () => {
    expect(parseAmount('')).toBeNull();
  });

  it('returns null for non-numeric input', () => {
    expect(parseAmount('abc')).toBeNull();
  });

  it('returns null for a negative number', () => {
    expect(parseAmount('-50')).toBeNull();
  });

  it('returns null for zero', () => {
    expect(parseAmount('0')).toBeNull();
  });
});

// ─── T-BR7-4 sumRand ──────────────────────────────────────────────────────────

describe('T-BR7-4 sumRand', () => {
  it('0.10 + 0.20 gives exactly 0.30 (not a floating-point artifact)', () => {
    expect(sumRand([0.10, 0.20])).toBe(0.30);
  });

  it('ten times 0.10 gives exactly 1.00', () => {
    expect(sumRand(Array(10).fill(0.10))).toBe(1.00);
  });

  it('returns 0 for an empty array', () => {
    expect(sumRand([])).toBe(0);
  });

  it('handles whole numbers correctly', () => {
    expect(sumRand([100, 200, 300])).toBe(600);
  });

  it('handles typical receipt amounts', () => {
    expect(sumRand([149.99, 320.00, 89.50])).toBe(559.49);
  });
});
