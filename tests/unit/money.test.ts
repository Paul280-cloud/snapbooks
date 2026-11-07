import { formatRand } from '../../src/lib/rules/money';

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
