import { formatRand, parseAmount } from '../../src/lib/rules/money';

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
