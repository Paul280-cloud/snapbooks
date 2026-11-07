import { isFutureInSAST } from '../../src/lib/rules/date';

// SAST = UTC+2.  A date string "YYYY-MM-DD" is treated as local midnight SAST.
// 2026-11-07 is "today" in tests.  Jest runs in UTC (TZ=UTC set in jest.config).
// We test purely via known fixed dates rather than Date.now() so tests are stable.

describe('T-BR1-2 isFutureInSAST', () => {
  it('returns false for a date in the past', () => {
    expect(isFutureInSAST('2020-01-01', new Date('2026-01-01T00:00:00Z'))).toBe(false);
  });

  it('returns false for today', () => {
    // "today" in SAST: 2026-03-12 at 10:00 SAST = 08:00 UTC
    expect(isFutureInSAST('2026-03-12', new Date('2026-03-12T08:00:00Z'))).toBe(false);
  });

  it('returns true for a date one day in the future', () => {
    expect(isFutureInSAST('2026-03-13', new Date('2026-03-12T08:00:00Z'))).toBe(true);
  });

  it('returns true for a far-future date', () => {
    expect(isFutureInSAST('2099-12-31', new Date('2026-01-01T00:00:00Z'))).toBe(true);
  });

  it('returns false for an empty string', () => {
    expect(isFutureInSAST('', new Date('2026-03-12T08:00:00Z'))).toBe(false);
  });

  it('handles SAST date boundary: 23:30 UTC on 2026-03-14 = 01:30 SAST on 2026-03-15', () => {
    // The UTC instant 2026-03-14T23:30Z is already 2026-03-15 in SAST (+2).
    // So "2026-03-15" should NOT be future relative to that UTC instant.
    expect(isFutureInSAST('2026-03-15', new Date('2026-03-14T23:30:00Z'))).toBe(false);
  });

  it('handles SAST date boundary: 21:00 UTC on 2026-03-14 = 23:00 SAST on 2026-03-14', () => {
    // 2026-03-14T21:00Z = 2026-03-14T23:00 SAST → still 14th in SAST.
    // So "2026-03-15" IS future from this instant.
    expect(isFutureInSAST('2026-03-15', new Date('2026-03-14T21:00:00Z'))).toBe(true);
  });
});
