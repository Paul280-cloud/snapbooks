import { isAtReceiptLimit } from '../../src/lib/rules/limit';

describe('T-BR4-2 receipt limit', () => {
  it('isAtReceiptLimit(499) is false', () => {
    expect(isAtReceiptLimit(499)).toBe(false);
  });

  it('isAtReceiptLimit(500) is true', () => {
    expect(isAtReceiptLimit(500)).toBe(true);
  });

  it('isAtReceiptLimit(0) is false', () => {
    expect(isAtReceiptLimit(0)).toBe(false);
  });

  it('isAtReceiptLimit(501) is true', () => {
    expect(isAtReceiptLimit(501)).toBe(true);
  });
});
