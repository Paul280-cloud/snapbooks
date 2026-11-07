import { validatePassword } from '../../src/lib/rules/password';

describe('validatePassword', () => {
  it('T-AUTH-1 accepts "abcdefg1" (8 chars with digit)', () => {
    expect(validatePassword('abcdefg1')).toBe(true);
  });

  it('T-AUTH-1 accepts "12345678" (all digits, 8 chars)', () => {
    expect(validatePassword('12345678')).toBe(true);
  });

  it('T-AUTH-1 rejects "abcdefgh" (no digit)', () => {
    expect(validatePassword('abcdefgh')).toBe(false);
  });

  it('T-AUTH-1 rejects "abc1" (too short)', () => {
    expect(validatePassword('abc1')).toBe(false);
  });
});
